from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from market.models import Listing, Offer


# Create two pending test offers on each listing sold by USER_ID.
#  manage.py create_listing_offers <USER_ID>

User = get_user_model()


def _seed_two_buyers(stdout, style):
    alice, _ = User.objects.get_or_create(
        username="alice",
        defaults={
            "email": "alice@example.com",
            "first_name": "Alice",
            "last_name": "Johnson",
            "phone_number": "+12155551234",
            "phone_verified": True,
        },
    )
    alice.set_password("testpassword123")
    alice.save()

    bob, _ = User.objects.get_or_create(
        username="bob",
        defaults={
            "email": "bob@example.com",
            "first_name": "Bob",
            "last_name": "Williams",
            "phone_number": "+12155555678",
            "phone_verified": True,
        },
    )
    bob.set_password("testpassword123")
    bob.save()

    stdout.write(style.SUCCESS("Buyers ready: Alice Johnson, Bob Williams"))
    return alice, bob


def _add_offers_to_listing(listing, alice, bob):
    """Returns (created_count, skipped_count) for this listing."""
    _, created_alice = Offer.objects.get_or_create(
        user=alice,
        listing=listing,
        defaults={
            "offered_price": Decimal("40.00"),
            "message": "Would you take $40? I can pick up today.",
        },
    )

    _, created_bob = Offer.objects.get_or_create(
        user=bob,
        listing=listing,
        defaults={
            "offered_price": Decimal("45.00"),
            "message": "Interested! Is the price negotiable?",
        },
    )

    new_count = int(created_alice) + int(created_bob)
    return new_count, 2 - new_count


class Command(BaseCommand):
    help = "Create two pending test offers on each listing for USER_ID."

    def add_arguments(self, parser):
        parser.add_argument(
            "user_id",
            type=int,
            help="Seller's User.id; offers are added to all of their listings.",
        )

    def handle(self, *args, **options):
        user_id = options["user_id"]

        try:
            seller = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR(f"No user with id={user_id}"))
            return

        alice, bob = _seed_two_buyers(self.stdout, self.style)

        listings = list(Listing.objects.filter(seller=seller).order_by("id"))
        if not listings:
            self.stdout.write(
                self.style.WARNING(
                    f"User {seller.username} (id={user_id}) has no listings."
                )
            )
            return
        self.stdout.write(
            self.style.SUCCESS(
                f"Seeding offers on {len(listings)} listing(s) for "
                f"{seller.username} (id={user_id})"
            )
        )

        total_created = 0
        total_skipped = 0
        for listing in listings:
            c, s = _add_offers_to_listing(listing, alice, bob)
            total_created += c
            total_skipped += s
            self.stdout.write(
                f"  listing id={listing.id} {listing.title!r}: +{c} new, {s} skipped"
            )

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Created {total_created} offers, "
                f"skipped {total_skipped} (already existed)."
            )
        )
