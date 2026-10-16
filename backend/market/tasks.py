import logging

from celery import shared_task


logger = logging.getLogger(__name__)


@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=10,
    autoretry_for=(Exception,),
    retry_backoff=True,
)
def moderate_listing_task(self, listing_id):
    from market.models import Listing
    from utils.moderation import moderate_content

    try:
        listing = Listing.objects.get(id=listing_id)
    except Listing.DoesNotExist:
        logger.warning("Listing %s not found for moderation, skipping.", listing_id)
        return

    if listing.status != Listing.Status.PENDING:
        logger.info(
            "Listing %s status is %s (not PENDING), skipping.",
            listing_id,
            listing.status,
        )
        return

    text = f"{listing.title} {listing.description or ''}"

    image_urls = []
    for img in listing.images.all():
        if img.image and img.image.url.startswith("http"):
            image_urls.append(img.image.url)

    logger.info(
        "Moderating listing %s: text=%r, image_count=%d",
        listing_id,
        text[:100],
        len(image_urls),
    )

    is_safe = moderate_content(text, image_urls)

    status = Listing.Status.APPROVED if is_safe else Listing.Status.REJECTED
    logger.info("Listing %s moderation result: %s", listing_id, status)
    listing.status = status
    listing.save(update_fields=["status"])
