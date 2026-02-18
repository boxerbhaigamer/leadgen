"""
LeadGen SaaS Agent — Main Controller

Connects to the LeadGen SaaS platform, picks up scraping jobs from the
dashboard, scrapes Google Maps using Playwright, and uploads leads back
to the platform via API.

Usage:
    python agent.py
    python agent.py --headless
    python agent.py --once          (run one job and exit, don't poll)
"""

import argparse
import asyncio
import logging
import os
import sys
import time
import traceback

# Fix Windows console encoding for emoji/unicode output
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import requests
from playwright._impl._errors import TargetClosedError

import agent_config as config
from scraper import GoogleMapsScraper
from validator import process_leads

# ─── Logging Setup ───────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.FileHandler(config.ERROR_LOG, encoding="utf-8"),
        logging.StreamHandler(sys.stdout),
    ],
)
logger = logging.getLogger(__name__)


# ─── API Client ──────────────────────────────────────────────────────────────

class LeadGenAPI:
    """Client for the LeadGen SaaS API."""

    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url.rstrip("/")
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    def verify(self) -> dict:
        """Verify API key and return user info."""
        resp = requests.get(f"{self.base_url}/api/agent/verify", headers=self.headers, timeout=15)
        resp.raise_for_status()
        return resp.json()

    def get_jobs(self) -> list[dict]:
        """Get pending/running jobs."""
        resp = requests.get(f"{self.base_url}/api/agent/jobs", headers=self.headers, timeout=15)
        resp.raise_for_status()
        data = resp.json()
        return data.get("jobs", [])

    def update_job(self, job_id: str, status: str, leads_found: int | None = None) -> dict:
        """Update job status."""
        payload = {"job_id": job_id, "status": status}
        if leads_found is not None:
            payload["leads_found"] = leads_found
        resp = requests.patch(f"{self.base_url}/api/agent/jobs", headers=self.headers, json=payload, timeout=15)
        resp.raise_for_status()
        return resp.json()

    def upload_leads(self, job_id: str, leads: list[dict]) -> dict:
        """Upload a batch of leads."""
        payload = {"job_id": job_id, "leads": leads}
        resp = requests.post(f"{self.base_url}/api/agent/leads", headers=self.headers, json=payload, timeout=30)
        if not resp.ok:
            print(f"   ❌ API Error: {resp.status_code} - {resp.text}")
        resp.raise_for_status()
        return resp.json()

    def get_job_status(self, job_id: str) -> str | None:
        """Check if a specific job has been stopped by the user."""
        try:
            jobs = self.get_jobs()
            for job in jobs:
                if job["id"] == job_id:
                    return job["status"]
            # Job not in pending/running list — might be stopped/completed
            return "stopped"
        except Exception:
            return None


# ─── Agent Runner ────────────────────────────────────────────────────────────

async def execute_job(api: LeadGenAPI, job: dict, scraper: GoogleMapsScraper) -> None:
    """Execute a single scraping job."""
    job_id = job["id"]
    city = job["city"]
    category = job["category"]
    platform = job.get("platform", "google_maps")

    print(f"\n{'═' * 60}")
    print(f"🚀 Starting job: {category} in {city} ({platform})")
    print(f"   Job ID: {job_id}")
    print(f"{'═' * 60}")

    # Mark job as running
    try:
        api.update_job(job_id, "running")
    except Exception as e:
        logger.error("Failed to update job status to running: %s", e)

    total_uploaded = 0
    current_batch = []
    seen_keys = set()  # Track unique leads (name, address) to deduplicate across batches
    last_status_check = time.time()

    try:
        # Scrape and process in real-time
        async for raw_lead in scraper.scrape_category_city(category, city):
            # Check stop signal periodically (every 5 seconds)
            if time.time() - last_status_check > 5:
                current_status = api.get_job_status(job_id)
                if current_status == "stopped":
                    print(f"\n   ⏹ Job stopped by user! Aborting...")
                    return
                last_status_check = time.time()

            # Validate lead
            validation_list = process_leads([raw_lead]) 
            if validation_list:
                clean_lead = validation_list[0]
                
                # Manual deduplication check
                name = clean_lead.get("business_name", "").lower().strip()
                address = clean_lead.get("address", "").lower().strip()
                key = (name, address)

                if key not in seen_keys and name:
                    seen_keys.add(key)
                    current_batch.append(clean_lead)
                    print(f"   ✨ Found: {clean_lead['business_name']}")
                else:
                    # Duplicate found
                    continue

            # Upload if batch is full
            if len(current_batch) >= config.BATCH_SIZE:
                await _upload_batch(api, job_id, current_batch, city, category, platform)
                total_uploaded += len(current_batch)
                print(f"   📤 Uploaded batch: {len(current_batch)} leads (Total: {total_uploaded})")
                current_batch = []

                # Update job status with current count
                try:
                    api.update_job(job_id, "running", leads_found=total_uploaded)
                except Exception:
                    pass

        # Upload remaining leads
        if current_batch:
            await _upload_batch(api, job_id, current_batch, city, category, platform)
            total_uploaded += len(current_batch)
            print(f"   📤 Uploaded final batch: {len(current_batch)} leads")

        # Mark job as completed
        api.update_job(job_id, "completed", leads_found=total_uploaded)
        print(f"\n   ✅ Job completed! {total_uploaded} leads uploaded.")

    except TargetClosedError as e:
        logger.error("Browser crashed during job %s: %s", job_id, str(e))
        print(f"   ❌ Browser crashed: {e}")
        try:
            api.update_job(job_id, "failed", leads_found=total_uploaded)
        except Exception:
            pass
        raise  # Let the main loop handle restart

    except Exception as e:
        logger.error("Job %s failed: %s", job_id, str(e))
        logger.error(traceback.format_exc())
        print(f"   ❌ Job failed: {e}")
        try:
            api.update_job(job_id, "failed", leads_found=total_uploaded)
        except Exception:
            pass


async def _upload_batch(api: LeadGenAPI, job_id: str, batch: list[dict], city: str, category: str, platform: str):
    """Helper to format and upload a batch of leads."""
    api_leads = []
    for lead in batch:
        api_leads.append({
            "business_name": lead.get("business_name", ""),
            "phone": lead.get("phone", ""),
            "email": lead.get("email", ""),
            "address": lead.get("address", ""),
            "city": lead.get("city", city),
            "rating": lead.get("rating", ""),
            "reviews": lead.get("reviews", ""),
            "website": lead.get("website", ""),
            "category": lead.get("category", category),
            "platform": platform,
        })

    try:
        api.upload_leads(job_id, api_leads)
    except Exception as e:
        logger.error("Failed to upload batch: %s", e)
        print(f"   ❌ Failed to upload batch: {e}")



async def run_agent(args):
    """Main agent loop."""
    print("\n" + "=" * 60)
    print("⚡ LEADGEN SAAS AGENT")
    print("=" * 60)

    # Validate config
    # Validate config & Interactive Setup
    if not config.API_KEY:
        print("\n⚠️  Configuration not found.")
        print("   Let's set up your agent!")
        
        api_key = input("\n🔑 Enter your API KEY (from Dashboard): ").strip()
        while not api_key:
            print("   API Key cannot be empty.")
            api_key = input("🔑 Enter your API KEY: ").strip()
            
        default_url = "https://leadgen-2wiv.vercel.app"
        api_url = input(f"🌐 Enter API URL (Press Enter for default: {default_url}): ").strip()
        if not api_url:
            api_url = default_url
            
        # Save to .env file
        env_path = os.path.join(os.getcwd(), ".env")
        try:
            with open(env_path, "w", encoding="utf-8") as f:
                f.write(f"LEADGEN_API_KEY={api_key}\n")
                f.write(f"LEADGEN_API_URL={api_url}\n")
                f.write("POLL_INTERVAL=10\n")
            print(f"   ✅ Configuration saved to {env_path}")
            
            # Reload config manually since module is already imported
            config.API_KEY = api_key
            config.API_BASE_URL = api_url
            
        except Exception as e:
            print(f"   ❌ Failed to save .env file: {e}")
            sys.exit(1)

    # Initialize API client
    api = LeadGenAPI(config.API_BASE_URL, config.API_KEY)

    # Verify connection
    print(f"\n🔌 Connecting to {config.API_BASE_URL}...")
    try:
        result = api.verify()
        user = result.get("user", {})
        print(f"   ✅ Connected! Welcome, {user.get('name', 'Agent')}!")
        print(f"   📋 Plan: {user.get('plan', 'free')} | Leads: {user.get('leads_count', 0)}")
    except requests.exceptions.ConnectionError:
        print(f"   ❌ Cannot connect to {config.API_BASE_URL}")
        print("   Make sure the web app is running (npm run dev)")
        sys.exit(1)
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            print("   ❌ Invalid API key! Check your .env file.")
        else:
            print(f"   ❌ API error: {e}")
        sys.exit(1)

    # Launch browser
    headless = args.headless
    print(f"\n🌐 Launching browser (headless={headless})...")
    scraper = GoogleMapsScraper(headless=headless)
    await scraper.start()

    try:
        if args.once:
            # Single run mode — process one job and exit
            print("\n🔍 Looking for pending jobs...")
            jobs = api.get_jobs()
            pending = [j for j in jobs if j["status"] == "pending"]

            if not pending:
                print("   ℹ️  No pending jobs found. Create a job from the dashboard first.")
                return

            await execute_job(api, pending[0], scraper)
        else:
            # Polling mode — continuously check for jobs
            print(f"\n🔄 Polling for jobs every {config.POLL_INTERVAL}s... (Ctrl+C to stop)")
            consecutive_empty = 0

            while True:
                try:
                    jobs = api.get_jobs()
                    pending = [j for j in jobs if j["status"] == "pending"]

                    if pending:
                        consecutive_empty = 0
                        for job in pending:
                            # Re-check job status before starting (might have been stopped)
                            current_status = api.get_job_status(job["id"])
                            if current_status == "stopped":
                                print(f"   ⏩ Skipping stopped job: {job['category']} in {job['city']}")
                                continue

                            try:
                                await execute_job(api, job, scraper)
                            except TargetClosedError:
                                # Browser crashed — restart and continue to next job
                                try:
                                    await scraper.restart()
                                except Exception:
                                    logger.error("Failed to restart browser, exiting.")
                                    print("   ❌ Could not restart browser. Exiting.")
                                    return
                    else:
                        consecutive_empty += 1
                        if consecutive_empty == 1 or consecutive_empty % 6 == 0:
                            print(f"   ⏳ No pending jobs. Waiting... (polling every {config.POLL_INTERVAL}s)")

                    await asyncio.sleep(config.POLL_INTERVAL)

                except KeyboardInterrupt:
                    raise
                except Exception as e:
                    logger.error("Polling error: %s", e)
                    print(f"   ⚠️  Error during polling: {e}")
                    await asyncio.sleep(config.POLL_INTERVAL)

    except KeyboardInterrupt:
        print("\n\n⚠️  Agent stopped by user.")

    finally:
        await scraper.stop()
        print("👋 Agent shut down. Goodbye!")


def main():
    parser = argparse.ArgumentParser(
        description="⚡ LeadGen SaaS Agent — Scrape leads from Google Maps and upload to your dashboard",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python agent.py                Run agent in polling mode (checks for jobs continuously)
  python agent.py --headless     Run with invisible browser
  python agent.py --once         Process one pending job and exit
        """,
    )

    parser.add_argument(
        "--headless",
        action="store_true",
        default=False,
        help="Run browser in headless mode (no visible window)",
    )
    parser.add_argument(
        "--once",
        action="store_true",
        default=False,
        help="Process one pending job and exit (don't poll continuously)",
    )

    args = parser.parse_args()
    asyncio.run(run_agent(args))


if __name__ == "__main__":
    main()
