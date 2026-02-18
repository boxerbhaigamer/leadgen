# LeadGen SaaS Agent

The agent runs on your Windows PC and scrapes Google Maps for business leads. It connects to the LeadGen SaaS dashboard to receive jobs and upload results.

## Setup

### 1. Install Dependencies

```bash
cd agent
pip install -r requirements.txt
playwright install chromium
```

### 2. Configure API Key

```bash
copy .env.example .env
```

Edit `.env` and paste your API key from **Dashboard → Settings → API Key**.

### 3. Run the Agent

```bash
# Polling mode (continuously checks for new jobs)
python agent.py

# Headless mode (no visible browser)
python agent.py --headless

# Single job mode (process one job and exit)
python agent.py --once
```

## How It Works

1. You create a scraping job from the **Dashboard → New Job**
2. The agent picks up the pending job automatically
3. It opens Google Maps, scrolls through results, extracts business details
4. Leads are uploaded to your dashboard in real-time batches
5. You can **Stop** a job from the dashboard at any time

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `LEADGEN_API_URL` | `http://localhost:3000` | URL of your LeadGen SaaS instance |
| `LEADGEN_API_KEY` | *(required)* | Your API key from Dashboard → Settings |
| `POLL_INTERVAL` | `10` | Seconds between job polls |
