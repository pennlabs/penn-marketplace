from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from market.models import Listing, Offer


# Create 25 pending test offers on each listing sold by USER_ID.
#  manage.py create_listing_offers <USER_ID>

User = get_user_model()


TEST_BUYER_COUNT = 25


def _seed_buyers():
    usernames = [
        f"marketplace_test_buyer_{index:02d}"
        for index in range(1, TEST_BUYER_COUNT + 1)
    ]
    if User.objects.filter(username__in=usernames).exists():
        raise CommandError(
            "Test buyer usernames already exist. Refusing to reuse accounts "
            "or change existing credentials."
        )

    # Unusable passwords keep these development-only accounts from password login.
    return [
        User.objects.create_user(
            username=username,
            password=None,
            email=f"{username}@example.invalid",
            first_name="Test Buyer",
            last_name=f"{index:02d}",
            phone_number=f"+1215555{index:04d}",
            phone_verified=True,
        )
        for index, username in enumerate(usernames, start=1)
    ]


def _add_offers_to_listing(listing, buyers):
    offers = []
    for index, buyer in enumerate(buyers):
        amount = Decimal("35.00") + Decimal("2.50") * index
        offers.append(
            Offer(
                user=buyer,
                listing=listing,
                offered_price=amount,
                message=f"I can offer ${amount:.2f}. Is it still available?",
            )
        )
    Offer.objects.bulk_create(offers)
    return len(offers)


class Command(BaseCommand):
    help = (
        "Create 25 distinct pending test offers on each listing for USER_ID. "
        "Development only; refuses existing test buyer usernames."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "user_id",
            type=int,
            help="Seller's User.id; offers are added to all of their listings.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError(
                "This command is only available in development (DEBUG=True)."
            )

        user_id = options["user_id"]

        try:
            seller = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"No user with id={user_id}"))
            return

        listings = list(Listing.objects.filter(seller=seller).order_by("id"))
        if not listings:
            self.stdout.write(
                self.style.WARNING(
                    f"User {seller.username} (id={user_id}) has no listings."
                )
            )
            return
        buyers = _seed_buyers()
        self.stdout.write(
            self.style.SUCCESS(
                f"Seeding offers on {len(listings)} listing(s) for "
                f"{seller.username} (id={user_id})"
            )
        )

        total_created = 0
        for listing in listings:
            created = _add_offers_to_listing(listing, buyers)
            total_created += created
            self.stdout.write(
                f"  listing id={listing.id} {listing.title!r}: +{created} new"
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Created {total_created} offers "
                f"from {len(buyers)} test buyers."
            )
        )
