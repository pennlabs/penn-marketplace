import io
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.management.base import CommandError
from django.test import TestCase, override_settings

from market.models import Category, Item, Offer


User = get_user_model()


@override_settings(DEBUG=True)
class TestCreateListingOffers(TestCase):
    def setUp(self):
        self.seller = User.objects.create_user(username="seller")
        self.item = Item.objects.create(
            seller=self.seller,
            title="Test desk",
            price=50,
            condition=Item.Condition.GOOD,
            category=Category.objects.create(name="Other"),
        )

    def run_command(self):
        call_command("create_listing_offers", self.seller.id, stdout=io.StringIO())

    def test_creates_pending_offers_with_unusable_passwords(self):
        self.run_command()
        self.assertEqual(self.item.offers_received.count(), 25)
        self.assertEqual(
            self.item.offers_received.values("user_id").distinct().count(), 25
        )
        self.assertEqual(
            self.item.offers_received.values("offered_price").distinct().count(), 25
        )
        self.assertEqual(
            set(self.item.offers_received.values_list("status", flat=True)),
            {Offer.Status.PENDING},
        )
        for index in range(1, 26):
            username = f"marketplace_test_buyer_{index:02d}"
            user = User.objects.get(username=username)
            self.assertFalse(user.has_usable_password())

    def test_existing_alice_and_bob_credentials_are_unchanged(self):
        existing = [
            User.objects.create_user(username=name, password="existing-test-password")
            for name in ("alice", "bob")
        ]
        hashes = {user.pk: user.password for user in existing}
        self.run_command()
        for user in existing:
            user.refresh_from_db()
            self.assertEqual(user.password, hashes[user.pk])
            self.assertFalse(Offer.objects.filter(user=user).exists())

    def test_offers_can_be_paged_in_groups_of_five(self):
        from rest_framework.test import APIClient

        self.run_command()
        client = APIClient()
        client.force_authenticate(self.seller)
        seen = set()
        for page in range(5):
            response = client.get(
                f"/market/listings/{self.item.id}/offers/",
                {"limit": 5, "offset": page * 5},
            )
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.data["count"], 25)
            self.assertEqual(len(response.data["results"]), 5)
            ids = {offer["id"] for offer in response.data["results"]}
            self.assertFalse(seen & ids)
            seen |= ids
            self.assertEqual(response.data["next"] is None, page == 4)
        self.assertEqual(len(seen), 25)

    @override_settings(DEBUG=False)
    def test_refuses_non_development_environment_without_writes(self):
        count = User.objects.count()
        with self.assertRaisesMessage(CommandError, "only available in development"):
            self.run_command()
        self.assertEqual(User.objects.count(), count)
        self.assertFalse(Offer.objects.exists())

    def test_refuses_existing_test_username_without_writes(self):
        for username in ("marketplace_test_buyer_01", "marketplace_test_buyer_25"):
            with self.subTest(username=username):
                existing = User.objects.create_user(
                    username=username, password="existing-test-password"
                )
                original_hash = existing.password
                count = User.objects.count()
                with self.assertRaisesMessage(CommandError, "already exist"):
                    self.run_command()
                existing.refresh_from_db()
                self.assertEqual(existing.password, original_hash)
                self.assertEqual(User.objects.count(), count)
                self.assertFalse(Offer.objects.exists())
                existing.delete()

    def test_repeated_run_does_not_change_credentials_or_add_offers(self):
        self.run_command()
        hashes = dict(User.objects.values_list("pk", "password"))
        with self.assertRaisesMessage(CommandError, "already exist"):
            self.run_command()
        self.assertEqual(dict(User.objects.values_list("pk", "password")), hashes)
        self.assertEqual(Offer.objects.count(), 25)

    def test_failure_rolls_back_new_test_accounts_and_offers(self):
        count = User.objects.count()
        with patch(
            "market.management.commands.create_listing_offers._add_offers_to_listing",
            side_effect=RuntimeError("Seeding failed"),
        ):
            with self.assertRaisesMessage(RuntimeError, "Seeding failed"):
                self.run_command()
        self.assertEqual(User.objects.count(), count)
        self.assertFalse(Offer.objects.exists())
