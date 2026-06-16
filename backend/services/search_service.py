from ddgs import DDGS
from typing import Optional

def verify_claim(text: str) -> Optional[bool]:
    """
    Returns:
    - True if web search confirms the claim is real
    - False if web search suggests it's false
    - None if inconclusive
    """
    try:
        
        query = text[:150].strip()

        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=3))

        if not results:
            return None

        combined = " ".join([r.get("body", "") for r in results]).lower()
        query_lower = query.lower()

        confirming_keywords = ["confirmed", "official", "announced", "reported", "according to"]
        denying_keywords = ["false", "fake", "misinformation", "debunked", "hoax", "fact check", "not true"]

        confirm_count = sum(1 for kw in confirming_keywords if kw in combined)
        deny_count = sum(1 for kw in denying_keywords if kw in combined)

        if deny_count > confirm_count:
            return False  # likely false
        elif confirm_count > 0:
            return True   # likely real
        else:
            return None   # inconclusive

    except Exception as e:
        print(f"[Search] Error verifying claim: {e}")
        return None