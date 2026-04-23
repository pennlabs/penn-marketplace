import logging

import requests
from django.conf import settings


logger = logging.getLogger(__name__)

OPENAI_MODERATION_API_URL = "https://api.openai.com/v1/moderations"


def moderate_content(text, image_urls=None):
    """
    Call OpenAI's Moderation API with text and optional image URLs.
    Returns True if ALL content is safe, False if any is flagged.
    """
    api_key = settings.OPENAI_API_KEY
    if not api_key:
        logger.warning("OPENAI_API_KEY not set, skipping moderation")
        return True

    inputs = [{"type": "text", "text": text}]
    for url in image_urls or []:
        inputs.append({"type": "image_url", "image_url": {"url": url}})

    try:
        response = requests.post(
            OPENAI_MODERATION_API_URL,
            headers={"Authorization": f"Bearer {api_key}"},
            json={"model": "omni-moderation-latest", "input": inputs},
            timeout=30,
        )
        response.raise_for_status()
        result = response.json()
        flagged = any(r["flagged"] for r in result["results"])
        logger.info("Moderation API response: flagged=%s", flagged)
        for r in result["results"]:
            scores = r.get("category_scores", {})
            high_scores = {k: v for k, v in scores.items() if v > 0.01}
            if high_scores:
                logger.info("  high scores: %s", high_scores)
        return not flagged
    except Exception:
        logger.exception("Moderation API call failed, defaulting to approved")
        return True
