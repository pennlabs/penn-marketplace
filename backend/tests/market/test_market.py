import datetime
import json
from unittest.mock import MagicMock

import pytz
from django.contrib.auth import get_user_model
from django.core.files.storage import Storage
from django.test import TestCase
from django.utils.timezone import now
from rest_framework.test import APIClient

from market.models import (
    Category,
    Item,
    Listing,
    ListingImage,
    Offer,
    Sublet,
    Tag,
)


User = get_user_model()


class BaseMarketTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.tags = self.load_tags()
        self.categories = self.load_categories()
        self.users = [
            self.load_user("user", "user@gmail.com", "user", True, True),
            self.load_user("user1", "user1@gmail.com", "user1", False, False),
        ]

    def load_tags(self):
        tags = [
            "New",
            "Used",
            "Couch",
            "Laptop",
            "Textbook",
            "Chair",
            "Apartment",
            "House",
        ]
        tag_objects = Tag.objects.bulk_create([Tag(name=tag) for tag in tags])
        return tag_objects

    def load_categories(self):
        categories = [
            "Book",
            "Electronics",
            "Furniture",
            "Food",
            "Sublet",
            "Other",
        ]
        category_objects = Category.objects.bulk_create(
            [Category(name=cat) for cat in categories]
        )
        return category_objects

    def load_user(self, username, email=None, password=None, is_self=False, auth=False):
        user = User.objects.create_user(username, email, password)
        if is_self:
            self.user = user
        if auth:
            self.client.force_authenticate(user)
        return user

    def load_items(self, filepath, user):
        items = []
        with open(filepath) as data:
            data = json.load(data)
            for item in data:
                created_item = Item.objects.create(
                    seller=user,
                    category=Category.objects.get(name=item["category"]),
                    title=item["title"],
                    description=item["description"],
                    price=item["price"],
                    negotiable=item["negotiable"],
                    created_at=now(),
                    expires_at=item["expires_at"],
                    external_link=item["external_link"],
                    condition=item["condition"],
                )
                created_item.tags.set(Tag.objects.filter(name__in=item["tags"]))
                created_item.save()
                items.append(created_item)
        return items

    def load_sublets(self, filepath, user):
        sublets = []
        with open(filepath) as data:
            data = json.load(data)
            for sublet in data:
                created_sublet = Sublet.objects.create(
                    seller=user,
                    title=sublet["title"],
                    description=sublet["description"],
                    price=sublet["price"],
                    negotiable=sublet["negotiable"],
                    created_at=now(),
                    expires_at=sublet["expires_at"],
                    external_link=sublet["external_link"],
                    address=sublet["address"],
                    beds=sublet["beds"],
                    baths=sublet["baths"],
                    start_date=sublet["start_date"],
                    end_date=sublet["end_date"],
                )
                created_sublet.tags.set(Tag.objects.filter(name__in=sublet["tags"]))
                created_sublet.save()
                sublets.append(created_sublet)
        return sublets

    def assert_dict_equal_ignoring_keys(
        self, actual, expected, ignored_keys=(), unordered_keys=()
    ):
        ignored = set(ignored_keys)
        unordered = set(unordered_keys)

        def sort_key(x):
            if isinstance(x, dict):
                return json.dumps(x, sort_keys=True)
            else:
                return str(x)

        def normalize(obj, path=""):
            if isinstance(obj, dict):
                out = {}
                for k, v in obj.items():
                    p = f"{path}{k}"
                    if p in ignored:
                        continue
                    val = normalize(v, p + ".")
                    if p in unordered and isinstance(val, list):
                        val = sorted(val, key=sort_key)
                    out[k] = val
                return out

            elif isinstance(obj, list):
                items = [normalize(e, path) for e in obj]
                if path.rstrip(".") in unordered:
                    items = sorted(items, key=sort_key)
                return items

            return obj

        self.assertEqual(normalize(actual), normalize(expected))


class TestTagGet(BaseMarketTest):
    def setUp(self):
        super().setUp()

    def test_get_tags(self):
        params = {
            "offset": 1,
            "limit": 2,
        }
        response = self.client.get("/market/tags/", params)
        expected_response = {
            "count": 8,
            "next": "http://testserver/market/tags/?limit=2&offset=3",
            "previous": "http://testserver/market/tags/?limit=2",
            "page_size": 2,
            "offset": 1,
            "results": [{"name": "Used"}, {"name": "Couch"}],
        }
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(), expected_response, [], ["results"]
        )


class TestItemGet(BaseMarketTest):
    def setUp(self):
        super().setUp()
        self.items = (
            self.load_items("tests/market/self_user_items.json", self.users[0])
            + self.load_items("tests/market/user_1_items.json", self.users[1])
            + self.load_sublets("tests/market/user_1_sublets.json", self.users[1])
        )

    def test_get_items(self):
        response = self.client.get("/market/listings/?type=item")
        expected_response = {
            "count": 3,
            "next": None,
            "previous": None,
            "page_size": 25,
            "offset": 0,
            "results": [
                {
                    "id": 2,
                    "seller": 2,
                    "tags": ["New", "Laptop"],
                    "title": "Macbook Pro",
                    "price": 2000.0,
                    "expires_at": "3000-08-12T01:00:00-04:00",
                    "images": [],
                    "favorite_count": 0,
                    "listing_type": "item",
                    "additional_data": {
                        "condition": "NEW",
                        "category": "Electronics",
                    },
                },
                {
                    "id": 1,
                    "seller": 1,
                    "tags": ["Used", "Textbook"],
                    "title": "Math Textbook",
                    "price": 20.0,
                    "expires_at": "3000-12-12T00:00:00-05:00",
                    "images": [],
                    "favorite_count": 0,
                    "listing_type": "item",
                    "additional_data": {
                        "condition": "GOOD",
                        "category": "Book",
                    },
                },
                {
                    "id": 3,
                    "seller": 2,
                    "tags": ["Couch"],
                    "title": "Couch",
                    "price": 400.0,
                    "expires_at": "3000-12-12T00:00:00-05:00",
                    "images": [],
                    "favorite_count": 0,
                    "listing_type": "item",
                    "additional_data": {
                        "condition": "FAIR",
                        "category": "Furniture",
                    },
                },
            ],
        }
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            [],
            ["results", "results.tags", "results.images"],
        )

    def test_get_item_seller(self):
        response = self.client.get("/market/listings/?type=item&seller=true")
        expected_response = {
            "count": 1,
            "next": None,
            "previous": None,
            "page_size": 25,
            "offset": 0,
            "results": [
                {
                    "id": 1,
                    "seller": 1,
                    "tags": ["Used", "Textbook"],
                    "title": "Math Textbook",
                    "price": 20.0,
                    "expires_at": "3000-12-12T00:00:00-05:00",
                    "images": [],
                    "favorite_count": 0,
                    "listing_type": "item",
                    "additional_data": {
                        "condition": "GOOD",
                        "category": "Book",
                    },
                }
            ],
        }
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            [],
            ["results", "results.tags", "results.images"],
        )

    def test_get_single_item_own(self):
        response = self.client.get(f"/market/listings/{self.items[0].id}/")
        response_json = response.json()
        expected_response = {
            "id": 1,
            "seller": 1,
            "buyers": [],
            "tags": ["Used", "Textbook"],
            "favorites": [],
            "title": "Math Textbook",
            "description": "2023 version",
            "external_link": "https://example.com/book",
            "price": 20.0,
            "negotiable": True,
            "created_at": "2025-11-10T00:29:35.301913-05:00",
            "expires_at": "3000-12-12T00:00:00-05:00",
            "images": [],
            "listing_type": "item",
            "additional_data": {"condition": "GOOD", "category": "Book"},
        }
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response_json,
            expected_response,
            ["created_at"],
            ["", "tags", "images", "buyers", "favorites"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response_json["created_at"])
                - datetime.datetime.now(pytz.UTC)
            ),
            datetime.timedelta(minutes=10),
        )

    def test_get_single_item_other(self):
        response = self.client.get(f"/market/listings/{self.items[1].id}/")
        expected_response = {
            "id": 2,
            "seller": 2,
            "buyer_count": 0,
            "tags": ["New", "Laptop"],
            "title": "Macbook Pro",
            "description": "M1 Chip",
            "external_link": "https://example.com/macbook",
            "price": 2000.0,
            "negotiable": True,
            "expires_at": "3000-08-12T01:00:00-04:00",
            "images": [],
            "favorite_count": 0,
            "listing_type": "item",
            "additional_data": {"condition": "NEW", "category": "Electronics"},
        }
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(), expected_response, [], ["", "tags", "images"]
        )


class TestItemPost(BaseMarketTest):
    def setUp(self):
        super().setUp()

    def test_create_item_all_fields(self):
        payload = {
            "id": 88,
            "seller": self.users[1].id,
            "buyers": [],
            "tags": ["New"],
            "title": "Math Textbook",
            "description": "2023 version",
            "external_link": "https://example.com/listing",
            "price": 20.0,
            "negotiable": True,
            "created_at": "2024-11-26T00:50:03.217587-05:00",
            "expires_at": "3000-12-12T00:00:00-05:00",
            "listing_type": "item",
            "additional_data": {"condition": "NEW", "category": "Book"},
            "images": [],
        }
        response = self.client.post("/market/listings/", payload, format="json")
        expected_response = {
            "id": int(f"{response.json()['id']}"),
            "seller": 1,
            "buyers": [],
            "tags": ["New"],
            "favorites": [],
            "title": "Math Textbook",
            "description": "2023 version",
            "external_link": "https://example.com/listing",
            "price": 20.0,
            "negotiable": True,
            "created_at": "2025-11-10T13:30:31.738777-05:00",
            "expires_at": "3000-12-12T00:00:00-05:00",
            "images": [],
            "listing_type": "item",
            "additional_data": {"condition": "NEW", "category": "Book"},
        }

        self.assertEqual(response.status_code, 201)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["", "tags", "images", "buyers", "favorites"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.UTC)
            ),
            datetime.timedelta(minutes=10),
        )
        response = self.client.get(f"/market/listings/{response.json()['id']}/")
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["", "tags", "images", "buyers", "favorites"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.timezone("UTC"))
            ),
            datetime.timedelta(minutes=10),
        )

    def test_create_item_exclude_unrequired(self):
        payload = {
            "tags": ["New"],
            "title": "Math Textbook",
            "description": "2023 version",
            "price": 20.0,
            "negotiable": True,
            "expires_at": "3000-12-12T00:00:00-05:00",
            "listing_type": "item",
            "additional_data": {"condition": "NEW", "category": "Book"},
        }
        response = self.client.post("/market/listings/", payload, format="json")
        expected_response = {
            "id": int(f"{response.json()['id']}"),
            "seller": 1,
            "buyers": [],
            "tags": ["New"],
            "favorites": [],
            "title": "Math Textbook",
            "description": "2023 version",
            "external_link": None,
            "price": 20.0,
            "negotiable": True,
            "created_at": "2025-11-10T13:50:41.221379-05:00",
            "expires_at": "3000-12-12T00:00:00-05:00",
            "images": [],
            "listing_type": "item",
            "additional_data": {"condition": "NEW", "category": "Book"},
        }

        self.assertEqual(response.status_code, 201)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["", "tags", "images", "buyers", "favorites"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.UTC)
            ),
            datetime.timedelta(minutes=10),
        )
        response = self.client.get(f"/market/listings/{response.json()['id']}/")
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["", "tags", "images", "buyers", "favorites"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.timezone("UTC"))
            ),
            datetime.timedelta(minutes=10),
        )

    def test_create_item_missing_field(self):
        payload = {
            "tags": ["New"],
            "category": "Book",
            "external_link": "https://example.com/listing",
            "price": 20.0,
            "negotiable": True,
            "expires_at": "3000-12-12T00:00:00-05:00",
        }
        response = self.client.post("/market/listings/", payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"title": ["This field is required."]})

    def test_create_item_invalid_category(self):
        payload = {
            "tags": ["New"],
            "title": "Math Textbook",
            "description": "2023 version",
            "external_link": "https://example.com/listing",
            "price": 20.0,
            "negotiable": True,
            "expires_at": "3000-12-12T00:00:00-05:00",
            "listing_type": "item",
            "additional_data": {"condition": "NEW", "category": "Textbook"},
        }
        response = self.client.post("/market/listings/", payload, format="json")
        res_json = json.loads(response.content)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            res_json,
            {"additional_data": {"category": "Category 'Textbook' does not exist."}},
        )

    def test_create_item_missing_required_additional_data(self):
        payload = {
            "tags": ["New"],
            "title": "Math Textbook",
            "description": "2023 version",
            "external_link": "https://example.com/listing",
            "price": 20.0,
            "negotiable": True,
            "expires_at": "3000-12-12T00:00:00-05:00",
            "listing_type": "item",
            "additional_data": {"condition": "NEW"},
        }
        response = self.client.post("/market/listings/", payload, format="json")
        expected_response = {
            "additional_data": {"category": "This field is required for item"}
        }
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), expected_response)

    def test_create_item_with_profanity_title(self):
        payload = {
            "tags": ["New"],
            "category": "Book",
            "title": "Fuck Textbook",
            "description": "Fuck 2023 version",
            "external_link": "https://example.com/listing",
            "price": 20.0,
            "negotiable": True,
            "expires_at": "3000-12-12T00:00:00-05:00",
        }
        response = self.client.post("/market/listings/", payload)
        self.assertEqual(response.status_code, 400)

        res_json = response.json()
        self.assertIn("title", res_json)
        self.assertIn("description", res_json)
        self.assertEqual(
            res_json["title"][0], "The title contains inappropriate language."
        )
        self.assertEqual(
            res_json["description"][0],
            "The description contains inappropriate language.",
        )


class TestItemPatch(BaseMarketTest):
    def setUp(self):
        super().setUp()
        self.items = self.load_items(
            "tests/market/self_user_items.json", self.users[0]
        ) + self.load_items("tests/market/user_1_items.json", self.users[1])

    def test_update_item_minimum_required(self):
        payload = {
            "category": "Book",
            "title": "Physics Textbook",
            "price": 25.0,
            "expires_at": "3000-12-13T00:00:00-05:00",
        }
        response = self.client.patch(f"/market/listings/{self.items[0].id}/", payload)
        expected_response = {
            "id": self.items[0].id,
            "seller": self.users[0].id,
            "buyers": [],
            "tags": ["Used", "Textbook"],
            "favorites": [],
            "title": "Physics Textbook",
            "description": "2023 version",
            "external_link": "https://example.com/book",
            "price": 25.0,
            "negotiable": True,
            "created_at": "2025-11-10T13:53:17.227573-05:00",
            "expires_at": "3000-12-13T00:00:00-05:00",
            "images": [],
            "listing_type": "item",
            "additional_data": {"condition": "GOOD", "category": "Book"},
        }

        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["tags", "images", "favorites", "buyers"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.timezone("UTC"))
            ),
            datetime.timedelta(minutes=10),
        )
        response = self.client.get(f"/market/listings/{self.items[0].id}/")
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["tags", "images", "favorites", "buyers"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.timezone("UTC"))
            ),
            datetime.timedelta(minutes=10),
        )

    def test_update_item_all_fields(self):
        payload = {
            "id": 7,
            "seller": self.users[1].id,
            "buyers": [],
            "tags": ["New"],
            "category": "Food",
            "title": "5 meal swipes",
            "description": "5 meal swipes for sale",
            "external_link": "https://example.com/meal-swipes",
            "price": 25.0,
            "negotiable": False,
            "created_at": "2024-11-26T00:50:03.217587-05:00",
            "expires_at": "3000-12-14T00:00:00-05:00",
            "images": [],
            "additional_data": {"condition": "GOOD", "category": "Book"},
        }
        response = self.client.patch(
            f"/market/listings/{self.items[0].id}/", payload, format="json"
        )
        expected_response = {
            "id": self.items[0].id,
            "seller": self.users[0].id,
            "buyers": [],
            "tags": ["New"],
            "favorites": [],
            "title": "5 meal swipes",
            "description": "5 meal swipes for sale",
            "external_link": "https://example.com/meal-swipes",
            "price": 25.0,
            "negotiable": False,
            "created_at": "2025-11-10T15:08:35.972861-05:00",
            "expires_at": "3000-12-14T00:00:00-05:00",
            "images": [],
            "listing_type": "item",
            "additional_data": {"condition": "GOOD", "category": "Book"},
        }

        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["tags", "images", "buyers", "favorites"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.timezone("UTC"))
            ),
            datetime.timedelta(minutes=10),
        )
        response = self.client.get(f"/market/listings/{self.items[0].id}/")
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["tags", "images", "buyers", "favorites"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.timezone("UTC"))
            ),
            datetime.timedelta(minutes=10),
        )

    def test_update_item_listing_type(self):
        payload = {
            "title": "Physics Textbook",
            "price": 25.0,
            "expires_at": "3000-12-13T00:00:00-05:00",
            "listing_type": "sublet",
            "additional_data": {
                "address": "123 Main St, Philadelphia, PA",
                "beds": 2,
                "baths": 1,
                "start_date": "2024-01-01T00:00:00-05:00",
                "end_date": "3000-05-31T00:00:00-04:00",
            },
        }
        response = self.client.patch(
            f"/market/listings/{self.items[0].id}/", payload, format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {"listing_type": "Cannot change listing type on update."},
        )

    def test_update_item_invalid_tag(self):
        payload = {
            "tags": ["Not a tag"],
            "category": "Book",
            "title": "Physics Textbook",
            "price": 25.0,
            "expires_at": "3000-12-13T00:00:00-05:00",
        }
        response = self.client.patch(f"/market/listings/{self.items[0].id}/", payload)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {"tags": ["Object with name=Not a tag does not exist."]},
        )

    def test_update_item_not_owned(self):
        payload = {"title": "New Title"}
        response = self.client.patch(
            f"/market/listings/{self.items[1].id}/", payload, format="json"
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.json(),
            {"detail": "You do not have permission to perform this action."},
        )


class TestItemDelete(BaseMarketTest):
    def setUp(self):
        super().setUp()
        self.items = self.load_items(
            "tests/market/self_user_items.json", self.users[0]
        ) + self.load_items("tests/market/user_1_items.json", self.users[1])

    def test_delete_item(self):
        self.assertTrue(Item.objects.filter(id=self.items[0].id).exists())
        response = self.client.delete(f"/market/listings/{self.items[0].id}/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Item.objects.filter(id=self.items[0].id).exists())

    def test_delete_item_not_owned(self):
        response = self.client.delete(f"/market/listings/{self.items[1].id}/")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.json(),
            {"detail": "You do not have permission to perform this action."},
        )


class TestSubletGet(BaseMarketTest):
    def setUp(self):
        super().setUp()
        sublets1 = self.load_sublets(
            "tests/market/self_user_sublets.json", self.users[0]
        )
        sublets2 = self.load_sublets("tests/market/user_1_sublets.json", self.users[1])
        self.sublets = sublets1 + sublets2

    def test_get_sublets(self):
        response = self.client.get("/market/listings/?type=sublet")
        self.assertEqual(response.status_code, 200)
        expected_response = {
            "count": 2,
            "next": None,
            "previous": None,
            "page_size": 25,
            "offset": 0,
            "results": [
                {
                    "id": self.sublets[0].id,
                    "seller": self.users[0].id,
                    "tags": ["New"],
                    "title": "Cira Green Sublet",
                    "price": 1350.0,
                    "expires_at": "3000-12-12T00:00:00-05:00",
                    "images": [],
                    "favorite_count": 0,
                    "listing_type": "sublet",
                    "additional_data": {
                        "address": "Cira Green, Philadelphia, PA",
                        "beds": 3,
                        "baths": 1,
                        "start_date": "2024-01-01",
                        "end_date": "3000-05-31",
                    },
                },
                {
                    "id": self.sublets[1].id,
                    "seller": self.users[1].id,
                    "tags": ["New"],
                    "title": "Rodin Quad",
                    "price": 1350.0,
                    "expires_at": "3000-12-12T00:00:00-05:00",
                    "images": [],
                    "favorite_count": 0,
                    "listing_type": "sublet",
                    "additional_data": {
                        "address": "3901 Locust Walk, Philadelphia, PA",
                        "beds": 4,
                        "baths": 1,
                        "start_date": "2024-01-01",
                        "end_date": "3000-05-31",
                    },
                },
            ],
        }

        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["results", "results.tags", "results.images", "results.favorites"],
        )

    def test_get_sublet_own(self):
        response = self.client.get(f"/market/listings/{self.sublets[0].id}/")
        self.assertEqual(response.status_code, 200)
        expected_response = {
            "id": self.sublets[0].id,
            "seller": self.users[0].id,
            "buyers": [],
            "tags": ["New"],
            "favorites": [],
            "title": "Cira Green Sublet",
            "description": (
                "Fully furnished 3-bedroom apartment available for sublet "
                "with all amenities included."
            ),
            "external_link": "https://example.com/cira-green",
            "price": 1350.0,
            "negotiable": False,
            "created_at": "2025-11-10T15:29:52.441679-05:00",
            "expires_at": "3000-12-12T00:00:00-05:00",
            "images": [],
            "listing_type": "sublet",
            "additional_data": {
                "address": "Cira Green, Philadelphia, PA",
                "beds": 3,
                "baths": 1,
                "start_date": "2024-01-01",
                "end_date": "3000-05-31",
            },
        }

        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["", "tags", "images", "buyers", "favorites"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.timezone("UTC"))
            ),
            datetime.timedelta(minutes=10),
        )

    def test_get_sublet_other(self):
        response = self.client.get(f"/market/listings/{self.sublets[1].id}/")
        self.assertEqual(response.status_code, 200)
        expected_response = {
            "id": self.sublets[1].id,
            "seller": self.users[1].id,
            "buyer_count": 0,
            "tags": ["New"],
            "title": "Rodin Quad",
            "description": (
                "Fully furnished 4-bedroom apartment available for sublet "
                "with all amenities included."
            ),
            "external_link": "https://example.com/rodin-quad",
            "price": 1350.0,
            "negotiable": False,
            "expires_at": "3000-12-12T00:00:00-05:00",
            "images": [],
            "favorite_count": 0,
            "listing_type": "sublet",
            "additional_data": {
                "address": "3901 Locust Walk, Philadelphia, PA",
                "beds": 4,
                "baths": 1,
                "start_date": "2024-01-01",
                "end_date": "3000-05-31",
            },
        }
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["", "tags", "images", "buyers", "favorites"],
        )

    def test_get_single_sublet_invalid_id(self):
        response = self.client.get(f"/market/listings/{self.sublets[1].id + 1}/")
        self.assertEqual(response.status_code, 404)


class TestSubletPost(BaseMarketTest):
    def setUp(self):
        super().setUp()

    def test_create_sublet(self):
        payload = {
            "id": 3,
            "images": [],
            "title": "Cira Green Sublet 2",
            "description": (
                "Fully furnished 3-bedroom apartment available"
                " for sublet with all amenities included."
            ),
            "external_link": "https://example.com/listing",
            "price": 1350.0,
            "negotiable": False,
            "expires_at": "3000-12-12T00:00:00-05:00",
            "seller": self.users[0].id,
            "category": "Sublet",
            "buyers": [],
            "tags": ["New"],
            "favorites": [],
            "listing_type": "sublet",
            "additional_data": {
                "address": "3901 Locust Walk, Philadelphia, PA",
                "beds": 4.0,
                "baths": 1.0,
                "start_date": "2024-01-01",
                "end_date": "3000-05-31",
            },
        }
        response = self.client.post("/market/listings/", payload, format="json")
        expected_response = {
            "id": response.json()["id"],
            "images": [],
            "title": "Cira Green Sublet 2",
            "description": (
                "Fully furnished 3-bedroom apartment available for sublet "
                "with all amenities included."
            ),
            "external_link": "https://example.com/listing",
            "price": 1350.0,
            "negotiable": False,
            "created_at": "2025-09-05T00:48:08.880144-04:00",
            "expires_at": "3000-12-12T00:00:00-05:00",
            "seller": self.users[0].id,
            "buyers": [],
            "tags": ["New"],
            "favorites": [],
            "listing_type": "sublet",
            "additional_data": {
                "address": "3901 Locust Walk, Philadelphia, PA",
                "beds": 4.0,
                "baths": 1.0,
                "start_date": "2024-01-01",
                "end_date": "3000-05-31",
            },
        }
        self.assertEqual(response.status_code, 201)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["tags", "images", "buyers", "favorites"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.timezone("UTC"))
            ),
            datetime.timedelta(minutes=10),
        )
        response = self.client.get(f"/market/listings/{response.json()['id']}/")
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["tags", "images", "buyers", "favorites"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.timezone("UTC"))
            ),
            datetime.timedelta(minutes=10),
        )


class TestSubletPatchDelete(BaseMarketTest):
    def setUp(self):
        super().setUp()
        sublets1 = self.load_sublets(
            "tests/market/self_user_sublets.json", self.users[0]
        )
        sublets2 = self.load_sublets("tests/market/user_1_sublets.json", self.users[1])
        self.sublets = sublets1 + sublets2

    def test_update_sublet(self):
        payload = {
            "id": 7,
            "images": [],
            "title": "Cira Green Sublet 2",
            "description": (
                "Fully furnished 3-bedroom apartment "
                "available for sublet with all amenities included."
            ),
            "external_link": "https://example.com/listing",
            "price": 1450.0,
            "negotiable": False,
            "expires_at": "3000-12-12T00:00:00-05:00",
            "seller": self.users[0].id,
            "buyers": [],
            "tags": ["Apartment", "Used"],
            "favorites": [],
            "listing_type": "sublet",
            "additional_data": {
                "address": "3901 Locust Walk, Philadelphia, PA",
                "beds": 4.0,
                "baths": 2.0,
                "start_date": "2024-01-01",
                "end_date": "2025-05-31",
            },
        }
        response = self.client.patch(
            f"/market/listings/{self.sublets[0].id}/", payload, format="json"
        )
        expected_response = {
            "id": int(self.sublets[0].id),
            "seller": 1,
            "buyers": [],
            "tags": ["Used", "Apartment"],
            "favorites": [],
            "title": "Cira Green Sublet 2",
            "description": (
                "Fully furnished 3-bedroom apartment available for sublet "
                "with all amenities included."
            ),
            "external_link": "https://example.com/listing",
            "price": 1450.0,
            "negotiable": False,
            "created_at": "2025-11-10T19:27:07.475166-05:00",
            "expires_at": "3000-12-12T00:00:00-05:00",
            "images": [],
            "listing_type": "sublet",
            "additional_data": {
                "address": "3901 Locust Walk, Philadelphia, PA",
                "beds": 4,
                "baths": 2,
                "start_date": "2024-01-01",
                "end_date": "2025-05-31",
            },
        }
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["tags", "images", "buyers", "favorites"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.timezone("UTC"))
            ),
            datetime.timedelta(minutes=10),
        )
        response = self.client.get(f"/market/listings/{self.sublets[0].id}/")
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["tags", "images", "buyers", "favorites"],
        )
        self.assertLessEqual(
            abs(
                datetime.datetime.fromisoformat(response.json()["created_at"])
                - datetime.datetime.now(pytz.timezone("UTC"))
            ),
            datetime.timedelta(minutes=10),
        )

    def test_update_sublet_non_sublet_category(self):
        payload = {
            "id": int(self.sublets[0].id),
            "seller": 1,
            "buyers": [],
            "tags": ["Used", "Apartment"],
            "favorites": [],
            "title": "Cira Green Sublet 2",
            "description": (
                "Fully furnished 3-bedroom apartment available for sublet "
                "with all amenities included."
            ),
            "external_link": "https://example.com/listing",
            "price": 1450.0,
            "negotiable": False,
            "created_at": "2025-11-10T19:27:07.475166-05:00",
            "expires_at": "3000-12-12T00:00:00-05:00",
            "images": [],
            "listing_type": "item",
            "additional_data": {
                "address": "3901 Locust Walk, Philadelphia, PA",
                "beds": 4,
                "baths": 2,
                "start_date": "2024-01-01",
                "end_date": "2025-05-31",
            },
        }
        response = self.client.patch(
            f"/market/listings/{self.sublets[0].id}/", payload, format="json"
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(
            response.json(),
            {"listing_type": "Cannot change listing type on update."},
        )

    def test_update_sublet_invalid_date(self):
        payload = {
            "id": int(self.sublets[0].id),
            "seller": 1,
            "buyers": [],
            "tags": ["Used", "Apartment"],
            "favorites": [],
            "title": "Cira Green Sublet 2",
            "description": (
                "Fully furnished 3-bedroom apartment available for sublet "
                "with all amenities included."
            ),
            "external_link": "https://example.com/listing",
            "price": 1450.0,
            "negotiable": False,
            "created_at": "2025-11-10T19:27:07.475166-05:00",
            "expires_at": "3000-12-12T00:00:00-05:00",
            "images": [],
            "listing_type": "sublet",
            "additional_data": {
                "address": "3901 Locust Walk, Philadelphia, PA",
                "beds": 4,
                "baths": 2,
                "start_date": "2026-01-01",
                "end_date": "2025-05-31",
            },
        }
        response = self.client.patch(
            f"/market/listings/{self.sublets[0].id}/", payload, format="json"
        )
        expected_response = {"end_date": ["End date must be after start date"]}
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), expected_response)

    def test_delete_sublet(self):
        self.assertTrue(Listing.objects.filter(id=self.sublets[0].id).exists())
        response = self.client.delete(f"/market/listings/{self.sublets[0].id}/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Listing.objects.filter(id=self.sublets[0].id).exists())

    def test_delete_sublet_not_owned(self):
        response = self.client.delete(f"/market/listings/{self.sublets[1].id}/")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.json(),
            {"detail": "You do not have permission to perform this action."},
        )

    def test_delete_sublet_invalid_id(self):
        invalid_id = 1
        while Listing.objects.filter(id=invalid_id).exists():
            invalid_id += 1
        response = self.client.delete(f"/market/listings/{invalid_id}/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.json(), {"detail": "No Listing matches the given query."}
        )


class TestOffer(BaseMarketTest):
    def setUp(self):
        super().setUp()
        self.items = self.load_items(
            "tests/market/self_user_items.json", self.users[0]
        ) + self.load_items("tests/market/user_1_items.json", self.users[1])
        self.sublets = self.load_sublets(
            "tests/market/self_user_sublets.json", self.users[0]
        ) + self.load_sublets("tests/market/user_1_sublets.json", self.users[1])
        self.offers = [
            Offer.objects.create(
                user=self.users[0],
                listing=self.items[1],
                email="self_user@gmail.com",
            ),
            Offer.objects.create(
                user=self.users[0],
                listing=self.sublets[1],
                email="self_user@gmail.com",
                phone_number="+15555555555",
                message="I want this",
            ),
            Offer.objects.create(
                user=self.users[1],
                listing=self.items[0],
                email="user1@gmail.com",
                phone_number="+15555555555",
                message="",
            ),
        ]

    def test_get_all_user_offers(self):
        response = self.client.get("/market/offers/made/")
        expected_response = {
            "count": 2,
            "next": None,
            "previous": None,
            "page_size": 25,
            "offset": 0,
            "results": [
                {
                    "id": self.offers[0].id,
                    "phone_number": None,
                    "email": "self_user@gmail.com",
                    "message": "",
                    "user": self.users[0].id,
                    "listing": self.items[1].id,
                },
                {
                    "id": self.offers[1].id,
                    "phone_number": "+15555555555",
                    "email": "self_user@gmail.com",
                    "message": "I want this",
                    "user": self.users[0].id,
                    "listing": self.sublets[1].id,
                },
            ],
        }
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["results.created_at"],
            ["results"],
        )
        for offer in response.json()["results"]:
            self.assertLessEqual(
                abs(
                    datetime.datetime.fromisoformat(offer["created_at"])
                    - datetime.datetime.now(pytz.timezone("UTC"))
                ),
                datetime.timedelta(minutes=10),
            )

    def test_list_item_offers(self):
        response = self.client.get(f"/market/listings/{self.items[0].id}/offers/")
        expected = {
            "count": 1,
            "next": None,
            "previous": None,
            "page_size": 25,
            "offset": 0,
            "results": [
                {
                    "id": self.offers[2].id,
                    "phone_number": "+15555555555",
                    "email": "user1@gmail.com",
                    "message": "",
                    "user": self.users[1].id,
                    "listing": self.items[0].id,
                }
            ],
        }
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(), expected, ["results.created_at"], ["results"]
        )

    def test_get_offer_other(self):
        response = self.client.get(f"/market/listings/{self.items[1].id}/offers/")
        expected = {"detail": "You do not have permission to perform this action."}
        self.assertEqual(response.status_code, 403)
        self.assert_dict_equal_ignoring_keys(
            response.json(), expected, ["created_at"], [""]
        )

    def test_list_item_offers_invalid_item(self):
        invalid_id = 1
        while Listing.objects.filter(id=invalid_id).exists():
            invalid_id += 1
        response = self.client.get(f"/market/listings/{invalid_id}/offers/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.json(), {"detail": "No Listing matches the given query"}
        )

    def test_create_offer_all_fields(self):
        payload = {
            "phone_number": "+1 (202) 555 0100",
            "email": "self_user@gmail.com",
            "message": "I want this",
        }
        response = self.client.post(
            f"/market/listings/{self.items[2].id}/offers/",
            payload,
            format="json",
        )
        expected_response = {
            "id": response.json()["id"],
            "phone_number": "+12025550100",
            "email": "self_user@gmail.com",
            "message": "I want this",
            "user": self.users[0].id,
            "listing": self.items[2].id,
        }
        self.assertEqual(response.status_code, 201)
        self.assert_dict_equal_ignoring_keys(
            response.json(), expected_response, ["created_at"], [""]
        )

    def test_create_offer_required_fields(self):
        payload = {"phone_number": "+12025550100"}
        response = self.client.post(
            f"/market/listings/{self.items[2].id}/offers/",
            payload,
            format="json",
        )
        expected_response = {
            "id": response.json()["id"],
            "phone_number": "+12025550100",
            "email": None,
            "message": "",
            "user": self.users[0].id,
            "listing": self.items[2].id,
        }
        self.assertEqual(response.status_code, 201)
        self.assert_dict_equal_ignoring_keys(
            response.json(), expected_response, ["created_at"], [""]
        )

    def test_create_offer_invalid(self):
        payload = {}
        response = self.client.post(
            f"/market/listings/{self.items[2].id}/offers/",
            payload,
            format="json",
        )
        expected_response = {"phone_number": ["This field is required."]}
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), expected_response)

    def test_create_offer_existing(self):
        payload = {
            "phone_number": "+1 (202) 555 0100",
            "email": "self_user@gmail.com",
            "message": "I want this",
        }
        response = self.client.post(
            f"/market/listings/{self.items[1].id}/offers/",
            payload,
            format="json",
        )
        expected_response = ["Offer already exists"]
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), expected_response)

    def test_delete_offer(self):
        self.assertTrue(Offer.objects.filter(id=self.offers[0].id).exists())
        response = self.client.delete(f"/market/listings/{self.items[1].id}/offers/")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Offer.objects.filter(id=self.offers[0].id).exists())

    def test_delete_offer_nonexistent(self):
        invalid_id = 1
        while Offer.objects.filter(id=invalid_id).exists():
            invalid_id += 1
        response = self.client.delete(f"/market/listings/{invalid_id}/offers/")
        self.assertEqual(response.status_code, 404)


class TestFavorites(BaseMarketTest):
    def setUp(self):
        super().setUp()
        self.items = self.load_items(
            "tests/market/self_user_items.json", self.users[0]
        ) + self.load_items("tests/market/user_1_items.json", self.users[1])
        self.items[0].favorites.add(self.users[1])
        self.items[1].favorites.add(self.users[0])

    def test_get_favorites_for_item_owned(self):
        response = self.client.get(f"/market/listings/{self.items[0].id}/")
        expected_response = {
            "id": self.items[0].id,
            "seller": self.users[0].id,
            "buyers": [],
            "tags": ["Used", "Textbook"],
            "favorites": [self.users[1].id],
            "title": "Math Textbook",
            "description": "2023 version",
            "external_link": "https://example.com/book",
            "price": 20.0,
            "negotiable": True,
            "created_at": "2025-11-10T20:56:55.486531-05:00",
            "expires_at": "3000-12-12T00:00:00-05:00",
            "images": [],
            "listing_type": "item",
            "additional_data": {"condition": "GOOD", "category": "Book"},
        }
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["tags", "images", "buyers", "favorites"],
        )

    def test_get_favorites_for_item_other(self):
        response = self.client.get(f"/market/listings/{self.items[1].id}/")
        expected_response = {
            "id": self.items[1].id,
            "seller": self.users[1].id,
            "buyer_count": 0,
            "tags": ["New", "Laptop"],
            "title": "Macbook Pro",
            "description": "M1 Chip",
            "external_link": "https://example.com/macbook",
            "price": 2000.0,
            "negotiable": True,
            "expires_at": "3000-08-12T01:00:00-04:00",
            "images": [],
            "favorite_count": 1,
            "listing_type": "item",
            "additional_data": {"condition": "NEW", "category": "Electronics"},
        }
        self.assertEqual(response.status_code, 200)
        self.assert_dict_equal_ignoring_keys(
            response.json(),
            expected_response,
            ["created_at"],
            ["tags", "images", "buyers", "favorites"],
        )

    def test_post_favorite(self):
        response = self.client.post(f"/market/listings/{self.items[2].id}/favorites/")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(Item.objects.get(id=self.items[2].id).favorites.count(), 1)
        self.assertEqual(
            Item.objects.get(id=self.items[2].id).favorites.first(),
            self.users[0],
        )

    def test_post_favorite_existing(self):
        response = self.client.post(f"/market/listings/{self.items[1].id}/favorites/")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), ["Favorite already exists"])
        self.assertEqual(Item.objects.get(id=self.items[1].id).favorites.count(), 1)

    def test_delete_favorite(self):
        response = self.client.delete(f"/market/listings/{self.items[1].id}/favorites/")
        self.assertEqual(response.status_code, 204)
        self.assertEqual(Item.objects.get(id=self.items[1].id).favorites.count(), 0)

    def test_delete_nonexistent_favorite(self):
        response = self.client.delete(f"/market/listings/{self.items[2].id}/favorites/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(Item.objects.get(id=self.items[2].id).favorites.count(), 0)
        self.assertEqual(response.json(), {"detail": "Favorite does not exist."})

    def test_delete_favorite_nonexistent_item(self):
        invalid_id = 1
        while Listing.objects.filter(id=invalid_id).exists():
            invalid_id += 1
        response = self.client.delete(f"/market/listings/{invalid_id}/favorites/")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(
            response.json(), {"detail": "No Listing matches the given query."}
        )


class TestImages(BaseMarketTest):
    def setUp(self):
        super().setUp()
        self.items = self.load_items(
            "tests/market/self_user_items.json", self.users[0]
        ) + self.load_items("tests/market/user_1_items.json", self.users[1])

        storage_mock = MagicMock(spec=Storage, name="StorageMock")
        storage_mock.generate_filename = lambda filename: filename
        storage_mock.save = MagicMock(side_effect=lambda name, *args, **kwargs: name)
        storage_mock.url = MagicMock(name="url")
        storage_mock.url.return_value = "http://penn-mobile.com/mock-image.png"
        ListingImage._meta.get_field("image").storage = storage_mock

    def test_create_image(self):
        with open("tests/market/mock_image.jpg", "rb") as image:
            self.assertEqual(Item.objects.get(id=self.items[0].id).images.count(), 0)
            response = self.client.post(
                f"/market/listings/{self.items[0].id}/images/",
                {"images": image},
            )
            self.assertEqual(response.status_code, 201)
            self.assertEqual(Item.objects.get(id=self.items[0].id).images.count(), 1)
            img = Item.objects.get(id=self.items[0].id).images.first()
            self.assertIsNotNone(img)

    def test_create_image_other_users_item(self):
        with open("tests/market/mock_image.jpg", "rb") as image:
            response = self.client.post(
                f"/market/listings/{self.items[1].id}/images/",
                {"images": image},
            )
            self.assertEqual(response.status_code, 403)
            self.assertEqual(
                response.json(),
                {"detail": "You do not have permission to perform this action."},
            )

    def test_create_delete_images(self):
        with open("tests/market/mock_image.jpg", "rb") as image:
            with open("tests/market/mock_image.jpg", "rb") as image2:
                response = self.client.post(
                    f"/market/listings/{self.items[0].id}/images/",
                    {"images": [image, image2]},
                    "multipart",
                )
                saved_images = response.json()
                self.assertEqual(response.status_code, 201)
                images = Listing.objects.get(id=self.items[0].id).images.all()
                self.assertTrue(images.exists())
                self.assertEqual(2, images.count())
                self.assertEqual(self.items[0].id, images.first().listing.id)
                response = self.client.delete(
                    f"/market/listings/images/{saved_images[0]['id']}/"
                )
                self.assertEqual(response.status_code, 204)
                self.assertFalse(
                    ListingImage.objects.filter(id=saved_images[0]["id"]).exists()
                )
                self.assertTrue(
                    ListingImage.objects.filter(id=saved_images[1]["id"]).exists()
                )
                self.assertEqual(1, ListingImage.objects.all().count())
