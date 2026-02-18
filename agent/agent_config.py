"""
LeadGen SaaS Agent — Configuration

Scraping and API settings for the SaaS-connected agent.
"""

import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# ─── API Settings ────────────────────────────────────────────────────────────
API_BASE_URL = os.getenv("LEADGEN_API_URL", "http://localhost:3000")
API_KEY = os.getenv("LEADGEN_API_KEY", "")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "10"))  # seconds between job polls

# ─── Paths ───────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ERROR_LOG = os.path.join(BASE_DIR, "error_log.txt")

# ─── Scraping Settings ──────────────────────────────────────────────────────
SCROLL_PAUSE_MIN = 2.0       # seconds
SCROLL_PAUSE_MAX = 5.0       # seconds
MAX_SCROLL_RETRIES = 5       # stop scrolling after this many retries with no new results
ACTION_DELAY_MIN = 1.5       # seconds between clicks
ACTION_DELAY_MAX = 3.5
HEADLESS = False              # default; can be overridden via CLI --headless

# ─── Email Extraction ───────────────────────────────────────────────────────
REQUEST_TIMEOUT = 10          # seconds for HTTP requests to business websites
EMAIL_PAGES = ["/", "/contact", "/contact-us", "/about", "/about-us"]

# ─── High Value Thresholds ──────────────────────────────────────────────────
HIGH_VALUE_MIN_RATING = 4.0
HIGH_VALUE_MIN_REVIEWS = 50

# ─── Lead Upload Settings ───────────────────────────────────────────────────
BATCH_SIZE = 10  # upload leads in batches of this size
