
import asyncio
import json
import logging
import sys
import traceback
import requests
from playwright.async_api import async_playwright

import agent_config as config
from scraper import GoogleMapsScraper
from validator import process_leads

# Config
LOG_FILE = "debug_log.txt"

def log(msg):
    print(msg)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(msg + "\n")

class DebugAPI:
    def __init__(self):
        self.base_url = config.API_BASE_URL
        self.headers = {
            "Authorization": f"Bearer {config.API_KEY}",
            "Content-Type": "application/json",
        }

    def get_jobs(self):
        resp = requests.get(f"{self.base_url}/api/agent/jobs", headers=self.headers)
        return resp.json().get("jobs", [])

    def upload_leads(self, job_id, leads):
        payload = {"job_id": job_id, "leads": leads}
        log(f"--- Uploading Batch ({len(leads)}) ---")
        log(json.dumps(leads, indent=2))
        
        resp = requests.post(f"{self.base_url}/api/agent/leads", headers=self.headers, json=payload)
        log(f"Response Status: {resp.status_code}")
        log(f"Response Body: {resp.text}")
        resp.raise_for_status()
        return resp.json()

async def run():
    log("Starting Debug Agent...")
    api = DebugAPI()
    
    # Get any pending/running job
    jobs = api.get_jobs()
    target_job = None
    for j in jobs:
        if j["status"] in ["pending", "running"]:
            target_job = j
            break
            
    if not target_job:
        log("No jobs found. Please create a job first.")
        return

    log(f"Processing Job: {target_job['id']} - {target_job['category']} in {target_job['city']}")
    
    scraper = GoogleMapsScraper(headless=True)
    await scraper.start()
    
    seen_keys = set()
    current_batch = []
    
    try:
        async for raw_lead in scraper.scrape_category_city(target_job["category"], target_job["city"]):
            clean_leads = process_leads([raw_lead])
            if not clean_leads: continue
            
            lead = clean_leads[0]
            name = lead.get("business_name", "").lower()
            addr = lead.get("address", "").lower()
            key = (name, addr)
            
            if key in seen_keys: continue
            seen_keys.add(key)
            current_batch.append(lead)
            
            if len(current_batch) >= 5: # Small batch to trigger faster
                try:
                    formatted_batch = []
                    for l in current_batch:
                         formatted_batch.append({
                            "business_name": l.get("business_name", ""),
                            "phone": l.get("phone", ""),
                            "email": l.get("email", ""),
                            "address": l.get("address", ""),
                            "city": l.get("city", target_job["city"]),
                            "rating": l.get("rating", ""),
                            "reviews": l.get("reviews", ""),
                            "website": l.get("website", ""),
                            "category": l.get("category", target_job["category"]),
                            "platform": target_job.get("platform", "google_maps"),
                        })
                    
                    api.upload_leads(target_job["id"], formatted_batch)
                    current_batch = []
                except Exception as e:
                    log(f"Upload Failed: {e}")
                    break

    except Exception as e:
        log(f"Scraper Error: {e}")
        log(traceback.format_exc())
    finally:
        await scraper.stop()

if __name__ == "__main__":
    open(LOG_FILE, "w").write("") # Clear log
    asyncio.run(run())
