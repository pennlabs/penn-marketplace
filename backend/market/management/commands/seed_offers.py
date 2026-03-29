from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from market.models import Category, Item, Listing, Offer


User = get_user_model()


class Command(BaseCommand):
    help = "Seed a listing with two pending offers for testing"

    def add_arguments(self, parser):
        parser.add_argument(
            "--listing-id",
            type=int,
            default=None,
            help="Add offers to an existing listing by ID instead of creating a new one",
        )

    def handle(self, *args, **options):
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

        self.stdout.write(self.style.SUCCESS("Buyers ready: Alice Johnson, Bob Williams"))

        listing_id = options["listing_id"]
        if listing_id:
            try:
                listing = Listing.objects.get(pk=listing_id)
            except Listing.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Listing with id={listing_id} not found"))
                return
            self.stdout.write(self.style.SUCCESS(f"Using existing listing: {listing.title} (id={listing.id})"))
        else:
            seller, _ = User.objects.get_or_create(
                username="lautaro",
                defaults={
                    "email": "lautaro@example.com",
                    "first_name": "Lautaro",
                    "last_name": "Beck",
                },
            )
            seller.set_password("testpassword123")
            seller.save()
            self.stdout.write(self.style.SUCCESS(f"Seller ready: {seller.get_full_name()}"))

            category, _ = Category.objects.get_or_create(name="Furniture")
            listing = Item.objects.create(
                seller=seller,
                title="New offer",
                description="ASDFASFAFS",
                price=Decimal("12312.00"),
                negotiable=True,
                expires_at=timezone.now() + timezone.timedelta(days=60),
                condition=Item.Condition.GOOD,
                category=category,
            )
            self.stdout.write(self.style.SUCCESS(f"Created listing: {listing.title}"))

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

        new_count = sum([created_alice, created_bob])
        skipped = 2 - new_count

        self.stdout.write(self.style.SUCCESS(f"Created {new_count} offers, skipped {skipped} (already existed)"))
        self.stdout.write(self.style.SUCCESS(f"\nDone! Offers added to listing id={listing.id}"))
