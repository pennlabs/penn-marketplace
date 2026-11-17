from decimal import Decimal
from threading import Event, Thread
from unittest.mock import patch

from django.contrib.auth import get_user_model
from django.db import close_old_connections, connection
from django.test import TestCase, TransactionTestCase, skipUnlessDBFeature
from rest_framework.exceptions import ValidationError
from rest_framework.test import APIClient

from market.models import Category, Item, Offer
from market.serializers import OfferDetailsSerializer, OfferStatusSerializer


User = get_user_model()


class OfferFixtures:
    def setUp(self):
        super().setUp()
        self.seller = User.objects.create_user(username="seller")
        self.buyer = User.objects.create_user(username="buyer")
        self.item = Item.objects.create(
            seller=self.seller,
            title="Desk",
            price=50,
            category=Category.objects.create(name="Other"),
            condition=Item.Condition.GOOD,
        )
        self.offer = Offer.objects.create(
            user=self.buyer, listing=self.item, offered_price=40
        )


class TestOfferDetailsUpdate(OfferFixtures, TestCase):
    def test_pending_edit_does_not_change_status(self):
        client = APIClient()
        client.force_authenticate(self.buyer)
        response = client.patch(
            f"/market/offers/{self.offer.id}/details/",
            {"offered_price": "42.00", "message": "Updated", "status": "accepted"},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.status, Offer.Status.PENDING)
        self.assertEqual(self.offer.offered_price, Decimal("42.00"))

    def test_accepted_and_rejected_offers_cannot_be_edited(self):
        client = APIClient()
        client.force_authenticate(self.buyer)
        for state in (Offer.Status.ACCEPTED, Offer.Status.REJECTED):
            with self.subTest(state=state):
                Offer.objects.filter(pk=self.offer.pk).update(status=state)
                response = client.patch(
                    f"/market/offers/{self.offer.id}/details/",
                    {"offered_price": "1.00"},
                    format="json",
                )
                self.assertEqual(response.status_code, 400)
                self.offer.refresh_from_db()
                self.assertEqual(self.offer.status, state)
                self.assertEqual(self.offer.offered_price, Decimal("40.00"))

    def test_stale_pending_instance_cannot_undo_seller_decision(self):
        for state in (Offer.Status.ACCEPTED, Offer.Status.REJECTED):
            with self.subTest(state=state):
                Offer.objects.filter(pk=self.offer.pk).update(
                    status=Offer.Status.PENDING
                )
                self.offer.refresh_from_db()
                serializer = OfferDetailsSerializer(
                    self.offer, data={"offered_price": "1.00"}, partial=True
                )
                serializer.is_valid(raise_exception=True)
                Offer.objects.filter(pk=self.offer.pk).update(status=state)
                with self.assertRaises(ValidationError):
                    serializer.save()
                self.offer.refresh_from_db()
                self.assertEqual(self.offer.status, state)
                self.assertEqual(self.offer.offered_price, Decimal("40.00"))

    def test_offer_page_fetches_buyers_without_per_offer_queries(self):
        for index in range(4):
            buyer = User.objects.create_user(username=f"buyer_{index}")
            Offer.objects.create(user=buyer, listing=self.item, offered_price=40)
        client = APIClient()
        client.force_authenticate(self.seller)
        with self.assertNumQueries(4):
            response = client.get(
                f"/market/listings/{self.item.id}/offers/", {"limit": 5, "offset": 0}
            )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 5)


class TestConcurrentOfferUpdates(OfferFixtures, TransactionTestCase):
    @skipUnlessDBFeature("has_select_for_update")
    def test_acceptance_after_edit_keeps_new_price(self):
        self.run_race(edit_first=True)

    @skipUnlessDBFeature("has_select_for_update")
    def test_edit_after_acceptance_is_rejected(self):
        self.run_race(edit_first=False)

    def run_race(self, *, edit_first):
        locked = Event()
        release = Event()
        second_started = Event()
        second_finished = Event()
        results = {}
        errors = []
        serializer_class = (
            OfferDetailsSerializer if edit_first else OfferStatusSerializer
        )
        original_update = serializer_class.update

        def pause_update(serializer, instance, validated_data):
            locked.set()
            if not release.wait(10):
                raise RuntimeError("Timed out waiting to release offer lock")
            return original_update(serializer, instance, validated_data)

        def request_update(edit, second=False):
            close_old_connections()
            try:
                client = APIClient()
                client.force_authenticate(self.buyer if edit else self.seller)
                if second:
                    second_started.set()
                endpoint = "details" if edit else "status"
                payload = {"offered_price": "42.00"} if edit else {"status": "accepted"}
                response = client.patch(
                    f"/market/offers/{self.offer.id}/{endpoint}/",
                    payload,
                    format="json",
                )
                results[endpoint] = response.status_code
            except Exception as error:
                errors.append(error)
            finally:
                connection.close()
                if second:
                    second_finished.set()

        first = Thread(target=request_update, args=(edit_first,))
        second = Thread(target=request_update, args=(not edit_first, True))
        with patch.object(serializer_class, "update", pause_update):
            try:
                first.start()
                self.assertTrue(
                    locked.wait(10), "First update never acquired its locks"
                )
                second.start()
                self.assertTrue(second_started.wait(10))
                self.assertFalse(
                    second_finished.wait(0.2), "Second update bypassed lock"
                )
            finally:
                release.set()
                first.join(10)
                if second.ident is not None:
                    second.join(10)
        self.assertFalse(first.is_alive() or second.is_alive())
        self.assertEqual(errors, [])
        self.assertEqual(results["status"], 200)
        self.assertEqual(results["details"], 200 if edit_first else 400)
        self.offer.refresh_from_db()
        self.assertEqual(self.offer.status, Offer.Status.ACCEPTED)
        self.assertEqual(
            self.offer.offered_price,
            Decimal("42.00") if edit_first else Decimal("40.00"),
        )
