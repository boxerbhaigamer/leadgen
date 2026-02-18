"""
Validator & Categorizer — validate, deduplicate, and categorize leads.
"""

import re
import sys

# Fix Windows console encoding for emoji/unicode output
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

import agent_config as config


def validate_phone(phone: str) -> str:
    """
    Normalize and validate an Indian phone number.
    Returns the cleaned phone string, or empty string if invalid.
    """
    if not phone:
        return ""

    # Remove all non-digit characters except +
    cleaned = re.sub(r"[^\d+]", "", phone)

    # Remove country code prefix
    if cleaned.startswith("+91"):
        cleaned = cleaned[3:]
    elif cleaned.startswith("91") and len(cleaned) > 10:
        cleaned = cleaned[2:]
    elif cleaned.startswith("0"):
        cleaned = cleaned[1:]

    # Indian mobile: 10 digits starting with 6-9
    # Indian landline: 10-11 digits
    if re.match(r"^[6-9]\d{9}$", cleaned):
        return f"+91{cleaned}"
    elif re.match(r"^\d{10,11}$", cleaned):
        return f"+91{cleaned}"

    # Return original if we can't validate but it has digits
    if len(cleaned) >= 7:
        return phone.strip()

    return ""


def validate_email(email: str) -> str:
    """Basic regex email validation. Returns the email if valid, else empty string."""
    if not email:
        return ""
    pattern = r"^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$"
    if re.match(pattern, email.strip()):
        return email.strip().lower()
    return ""


def deduplicate(leads: list[dict]) -> list[dict]:
    """
    Remove duplicate leads based on (business_name, address).
    Keeps the first occurrence.
    """
    seen: set[tuple[str, str]] = set()
    unique: list[dict] = []

    for lead in leads:
        key = (
            lead.get("business_name", "").lower().strip(),
            lead.get("address", "").lower().strip(),
        )
        if key not in seen and key[0]:  # skip if no name
            seen.add(key)
            unique.append(lead)

    removed = len(leads) - len(unique)
    if removed > 0:
        print(f"   🔄 Removed {removed} duplicate leads")

    return unique


def clean_lead(lead: dict) -> dict:
    """Apply validation to phone and email fields."""
    lead["phone"] = validate_phone(lead.get("phone", ""))
    lead["email"] = validate_email(lead.get("email", ""))
    return lead


def process_leads(leads: list[dict]) -> list[dict]:
    """
    Full pipeline: validate → deduplicate.
    Returns cleaned, deduplicated list of leads.
    """
    # 1. Validate phone/email on each lead
    leads = [clean_lead(lead) for lead in leads]

    # 2. Deduplicate
    leads = deduplicate(leads)

    return leads
