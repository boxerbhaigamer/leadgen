"""
Google Maps Scraper — Playwright-based scraper with anti-detection.

Searches Google Maps for "<category> in <city>", scrolls through results,
clicks each listing to extract details, and optionally visits websites
to extract email addresses.
"""

import asyncio
import random
import re
import sys
import time
import logging

# Fix Windows console encoding for emoji/unicode output
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import requests
import urllib3
from bs4 import BeautifulSoup
from playwright.async_api import async_playwright, Page, Browser, BrowserContext
from playwright._impl._errors import TargetClosedError

# Suppress SSL warnings from business website checks (we use verify=False intentionally)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

import agent_config as config

logger = logging.getLogger(__name__)


class GoogleMapsScraper:
    """Scrapes business listings from Google Maps."""

    def __init__(self, headless: bool = False):
        self.headless = headless
        self.browser: Browser | None = None
        self.context: BrowserContext | None = None
        self.page: Page | None = None
        self._playwright = None

    async def start(self):
        """Launch the browser with stealth settings."""
        self._playwright = await async_playwright().start()

        # Randomize viewport for fingerprint variation
        width = random.randint(1280, 1920)
        height = random.randint(800, 1080)

        self.browser = await self._playwright.chromium.launch(
            headless=self.headless,
            args=[
                "--disable-blink-features=AutomationControlled",
                "--no-sandbox",
                "--disable-dev-shm-usage",
            ],
        )

        self.context = await self.browser.new_context(
            viewport={"width": width, "height": height},
            user_agent=(
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/120.0.0.0 Safari/537.36"
            ),
            locale="en-IN",
            timezone_id="Asia/Kolkata",
        )

        # Stealth: mask webdriver property
        await self.context.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
            Object.defineProperty(navigator, 'languages', { get: () => ['en-IN', 'en-US', 'en'] });
            window.chrome = { runtime: {} };
        """)

        self.page = await self.context.new_page()
        logger.info("Browser launched (headless=%s, viewport=%dx%d)", self.headless, width, height)

    async def stop(self):
        """Close the browser gracefully."""
        try:
            if self.browser:
                await self.browser.close()
        except Exception:
            pass  # Browser may already be closed or connection lost
        try:
            if self._playwright:
                await self._playwright.stop()
        except Exception:
            pass
        self.browser = None
        self.context = None
        self.page = None
        self._playwright = None
        logger.info("Browser closed.")

    async def restart(self):
        """Fully tear down and relaunch the browser."""
        logger.info("🔄 Restarting browser...")
        print("   🔄 Browser crashed — restarting...")
        await self.stop()
        await asyncio.sleep(2)  # Brief cooldown
        await self.start()
        logger.info("✅ Browser restarted successfully.")
        print("   ✅ Browser back online!")

    async def _ensure_browser_alive(self):
        """Check if the browser/page is still responsive; restart if dead."""
        try:
            if self.page is None or self.browser is None:
                raise Exception("Browser or page is None")
            # Quick health check — try to evaluate a trivial expression
            await self.page.evaluate("1 + 1")
        except Exception:
            await self.restart()

    async def scrape_category_city(self, category: str, city: str):
        """
        Main entry point: search Google Maps for `<category> in <city>`,
        scroll through all results, and extract details from each listing.
        Yields dictionaries as they are extracted.
        """
        search_query = f"{category} in {city}"
        search_url = f"https://www.google.com/maps/search/{search_query.replace(' ', '+')}"

        logger.info("🔍 Searching: %s", search_query)
        print(f"\n🔍 Searching: {search_query}")

        # Ensure browser is alive before each search
        await self._ensure_browser_alive()

        # Use domcontentloaded instead of networkidle — Google Maps never stops loading
        for attempt in range(3):
            try:
                await self.page.goto(search_url, wait_until="domcontentloaded", timeout=30000)
                break
            except TargetClosedError:
                logger.warning("Browser died during navigation (attempt %d), restarting...", attempt + 1)
                await self.restart()
                if attempt == 2:
                    raise
            except Exception as e:
                if attempt < 2:
                    logger.warning("Navigation attempt %d failed, retrying: %s", attempt + 1, str(e))
                    await self._random_delay(2, 4)
                else:
                    raise

        # Wait for the results to actually render
        try:
            await self.page.wait_for_selector('div[role="feed"], div[role="main"]', timeout=15000)
        except Exception:
            logger.warning("Results container slow to load, continuing anyway...")

        await self._random_delay(3, 6)

        # Accept cookies/consent if prompted
        try:
            consent_btn = self.page.locator("button:has-text('Accept all')")
            if await consent_btn.count() > 0:
                await consent_btn.first.click()
                await self._random_delay(1, 2)
        except Exception:
            pass

        # Scroll to load all results
        await self._scroll_results()

        # Get all listing links
        listings = await self._get_listing_elements()
        print(f"   Found {len(listings)} listings")
        logger.info("Found %d listings for '%s'", len(listings), search_query)

        for i, listing in enumerate(listings):
            try:
                lead = await self._extract_listing_details(listing, city, category, i + 1, len(listings))
                if lead and lead.get("business_name"):
                    yield lead
            except Exception as e:
                logger.warning("Failed to extract listing %d: %s", i + 1, str(e))
                continue

        print(f"   ✅ Extraction finished for {search_query}")


    async def _scroll_results(self):
        """Scroll the results panel until no new listings load."""
        # Find the scrollable results container
        feed_selector = 'div[role="feed"]'

        try:
            await self.page.wait_for_selector(feed_selector, timeout=10000)
        except Exception:
            logger.warning("Results feed not found, trying alternate selector...")
            feed_selector = 'div[role="main"] div.m6QErb'
            try:
                await self.page.wait_for_selector(feed_selector, timeout=5000)
            except Exception:
                logger.warning("No results panel found.")
                return

        retries = 0
        prev_count = 0

        while retries < config.MAX_SCROLL_RETRIES:
            # Scroll down
            await self.page.evaluate(f"""
                const feed = document.querySelector('{feed_selector}');
                if (feed) feed.scrollTop = feed.scrollHeight;
            """)

            await self._random_delay(config.SCROLL_PAUSE_MIN, config.SCROLL_PAUSE_MAX)

            # Check for "end of list" indicator
            end_of_list = await self.page.locator("span.HlvSq").count()
            if end_of_list > 0:
                logger.info("Reached end of results list.")
                break

            # Count current listings
            current_count = await self.page.locator('div[role="feed"] > div > div > a').count()
            if current_count == 0:
                current_count = await self.page.locator('a[href*="/maps/place/"]').count()

            if current_count == prev_count:
                retries += 1
                logger.debug("No new results (retry %d/%d)", retries, config.MAX_SCROLL_RETRIES)
            else:
                retries = 0
                logger.debug("Loaded %d results (was %d)", current_count, prev_count)

            prev_count = current_count

        print(f"   📜 Scrolling complete — {prev_count} listings loaded")

    async def _get_listing_elements(self):
        """Get all listing link elements from the results."""
        # Primary selector for listing links
        links = await self.page.locator('div[role="feed"] > div > div > a').all()
        if not links:
            links = await self.page.locator('a[href*="/maps/place/"]').all()
        return links

    async def _extract_listing_details(
        self, element, city: str, category: str, index: int, total: int
    ) -> dict | None:
        """Click on a listing and extract all available details."""
        try:
            await element.click()
            await self._random_delay(config.ACTION_DELAY_MIN, config.ACTION_DELAY_MAX)

            # Wait for the detail panel to load
            await self.page.wait_for_selector('div[role="main"]', timeout=8000)
            await self._random_delay(0.5, 1.5)

        except Exception as e:
            logger.warning("Could not click listing %d: %s", index, str(e))
            return None

        lead = {
            "business_name": "",
            "rating": "",
            "reviews": "",
            "category": "",
            "address": "",
            "phone": "",
            "website": "",
            "email": "",
            "google_maps_url": "",
            "city": city,
            "search_category": category,
        }

        # ── Business Name ────────────────────────────────────────────
        try:
            name_el = self.page.locator('h1.DUwDvf')
            if await name_el.count() > 0:
                lead["business_name"] = (await name_el.first.inner_text()).strip()
        except Exception:
            pass

        # ── Rating & Reviews ─────────────────────────────────────────
        try:
            rating_el = self.page.locator('div.F7nice span[aria-hidden="true"]')
            if await rating_el.count() > 0:
                lead["rating"] = (await rating_el.first.inner_text()).strip()

            reviews_el = self.page.locator('div.F7nice span[aria-label*="review"]')
            if await reviews_el.count() > 0:
                reviews_text = (await reviews_el.first.get_attribute("aria-label")) or ""
                # Extract number from "123 reviews"
                match = re.search(r"([\d,]+)", reviews_text)
                if match:
                    lead["reviews"] = match.group(1).replace(",", "")
        except Exception:
            pass

        # ── Category ─────────────────────────────────────────────────
        try:
            cat_el = self.page.locator('button.DkEaL')
            if await cat_el.count() > 0:
                lead["category"] = (await cat_el.first.inner_text()).strip()
        except Exception:
            pass

        # ── Info items (address, phone, website) ─────────────────────
        try:
            info_buttons = await self.page.locator(
                'button[data-item-id], a[data-item-id]'
            ).all()

            for btn in info_buttons:
                try:
                    data_id = (await btn.get_attribute("data-item-id")) or ""
                    aria_label = (await btn.get_attribute("aria-label")) or ""

                    if data_id.startswith("address") or "address" in data_id.lower():
                        lead["address"] = aria_label.replace("Address: ", "").strip()
                    elif data_id.startswith("phone") or "phone" in data_id.lower():
                        lead["phone"] = aria_label.replace("Phone: ", "").strip()
                    elif data_id.startswith("authority"):
                        lead["website"] = aria_label.replace("Website: ", "").strip()
                except Exception:
                    continue
        except Exception:
            pass

        # ── Google Maps URL ──────────────────────────────────────────
        try:
            lead["google_maps_url"] = self.page.url
        except Exception:
            pass

        # ── Extract email from business website ──────────────────────
        if lead["website"]:
            print(f"   [{index}/{total}] {lead['business_name']} — 🌐 checking website for email...")
            lead["email"] = self._extract_email_from_website(lead["website"])
        else:
            print(f"   [{index}/{total}] {lead['business_name']}")

        return lead

    def _extract_email_from_website(self, url: str) -> str:
        """
        Visit the business website and try to find an email address.
        Checks the homepage and common pages like /contact, /about.
        """
        if not url.startswith("http"):
            url = "https://" + url

        # Normalize base URL
        base_url = url.rstrip("/")

        emails_found: set[str] = set()
        email_pattern = re.compile(
            r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}",
        )

        # Emails to exclude (generic/system emails)
        exclude_patterns = {
            "example.com", "sentry.io", "wixpress.com", "wordpress.com",
            "w3.org", "schema.org", "google.com", "facebook.com",
            "cloudflare.com", "googleapis.com",
        }

        for page_path in config.EMAIL_PAGES:
            try:
                page_url = base_url + page_path if page_path != "/" else base_url
                resp = requests.get(
                    page_url,
                    timeout=config.REQUEST_TIMEOUT,
                    headers={
                        "User-Agent": (
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                            "AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
                        ),
                    },
                    allow_redirects=True,
                    verify=False,
                )
                if resp.status_code == 200:
                    found = email_pattern.findall(resp.text)
                    for email in found:
                        domain = email.split("@")[1].lower()
                        if not any(ex in domain for ex in exclude_patterns):
                            emails_found.add(email.lower())

                    # Also check mailto: links via BeautifulSoup
                    soup = BeautifulSoup(resp.text, "html.parser")
                    for a_tag in soup.find_all("a", href=True):
                        href = a_tag["href"]
                        if href.startswith("mailto:"):
                            email = href.replace("mailto:", "").split("?")[0].strip()
                            if email_pattern.match(email):
                                domain = email.split("@")[1].lower()
                                if not any(ex in domain for ex in exclude_patterns):
                                    emails_found.add(email.lower())

            except Exception:
                continue

        # Return the first valid email (prefer non-generic ones)
        if emails_found:
            return sorted(emails_found)[0]
        return ""

    async def _random_delay(self, min_sec: float = 1.0, max_sec: float = 3.0):
        """Human-like random delay."""
        delay = random.uniform(min_sec, max_sec)
        await asyncio.sleep(delay)
