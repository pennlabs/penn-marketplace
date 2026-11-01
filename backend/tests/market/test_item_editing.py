from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient

from market.models import Category, Item


User = get_user_model()


class TestItemEditing(TestCase):
    def setUp(self):
        self.seller = User.objects.create_user(username="seller")
        self.category = Category.objects.create(name="Other")
        self.client = APIClient()
        self.client.force_authenticate(self.seller)

    def test_all_conditions_round_trip_through_owner_editor(self):
        for code, label in Item.Condition.choices:
            with self.subTest(code=code):
                item = Item.objects.create(
                    seller=self.seller,
                    title="Desk",
                    price=50,
                    category=self.category,
                    condition=code,
                )
                response = self.client.get(f"/market/listings/{item.id}/")
                self.assertEqual(response.status_code, 200)
                data = response.json()["additional_data"]
                self.assertEqual(data["condition"], label)
                self.assertEqual(data["condition_code"], code)

                response = self.client.patch(
                    f"/market/listings/{item.id}/",
                    {
                        "title": "Updated desk",
                        "listing_type": "item",
                        "additional_data": {
                            "condition": data["condition_code"],
                            "category": data["category"],
                        },
                    },
                    format="json",
                )
                self.assertEqual(response.status_code, 200)
                item.refresh_from_db()
                self.assertEqual(item.title, "Updated desk")
                self.assertEqual(item.condition, code)

    def test_public_response_keeps_display_label_and_code(self):
        item = Item.objects.create(
            seller=self.seller,
            title="Desk",
            price=50,
            category=self.category,
            condition=Item.Condition.GOOD,
        )
        self.client.force_authenticate(User.objects.create_user(username="buyer"))
        response = self.client.get(f"/market/listings/{item.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["additional_data"]["condition"], "Used - Good")
        self.assertEqual(response.json()["additional_data"]["condition_code"], "GOOD")
