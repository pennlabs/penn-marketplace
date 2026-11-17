from unittest.mock import MagicMock, patch

from django.core.files.storage import Storage
from django.core.files.uploadedfile import SimpleUploadedFile

from market.models import ListingImage
from tests.market.test_market import BaseMarketTest


MAX = ListingImage.MAX_PER_LISTING


class TestImageReplace(BaseMarketTest):
    def setUp(self):
        super().setUp()
        self.listing = self.load_items(
            "tests/market/self_user_items.json", self.users[0]
        )[0]
        self.other = self.load_items("tests/market/user_1_items.json", self.users[1])[0]
        self.storage = MagicMock(spec=Storage, name="StorageMock")
        self.storage.generate_filename = lambda filename: filename
        self.storage.save = MagicMock(side_effect=lambda name, *a, **kw: name)
        self.storage.url = MagicMock(return_value="http://example.com/mock.png")
        patcher = patch.object(
            ListingImage._meta.get_field("image"), "storage", self.storage
        )
        patcher.start()
        self.addCleanup(patcher.stop)
        self.client.force_authenticate(self.listing.seller)

    def fill(self, listing, count):
        return [
            ListingImage.objects.create(
                listing=listing,
                image=f"marketplace/images/{listing.id}-{i}.webp",
                order=i,
            )
            for i in range(count)
        ]

    def post(self, files=None, listing=None, **data):
        if files is None:
            files = [open("tests/market/mock_image.jpg", "rb")]
        try:
            with self.captureOnCommitCallbacks(execute=True):
                return self.client.post(
                    f"/market/listings/{(listing or self.listing).id}/images/",
                    {"images": files, **data},
                    "multipart",
                )
        finally:
            for f in files:
                f.close()

    def ids(self):
        return set(self.listing.images.values_list("id", flat=True))

    def deleted_names(self):
        return [c.args[0] for c in self.storage.delete.call_args_list]

    def test_replace_on_full_listing(self):
        old = self.fill(self.listing, MAX)
        response = self.post(replace=old[3].id, order=8)
        self.assertEqual(response.status_code, 201, response.content)
        new_id = response.json()[0]["id"]
        self.assertEqual(response.json()[0]["order"], 8)
        self.assertEqual(self.listing.images.count(), MAX)
        self.assertEqual(self.ids(), {o.id for o in old} - {old[3].id} | {new_id})
        self.assertEqual(self.deleted_names(), [old[3].image.name])

    def test_full_listing_without_replace_rejected(self):
        old = self.fill(self.listing, MAX)
        self.assertEqual(self.post().status_code, 400)
        self.assertEqual(self.ids(), {o.id for o in old})

    def test_invalid_upload_keeps_replaced_photo(self):
        old = self.fill(self.listing, MAX)
        bad = SimpleUploadedFile("bad.jpg", b"not an image", "image/jpeg")
        response = self.post(files=[bad], replace=old[0].id)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.ids(), {o.id for o in old})
        self.storage.delete.assert_not_called()

    def test_storage_failure_keeps_replaced_photo(self):
        old = self.fill(self.listing, MAX)
        self.storage.save.side_effect = OSError("S3 down")
        with self.assertRaises(OSError):
            self.post(replace=old[0].id)
        self.assertEqual(self.ids(), {o.id for o in old})
        self.assertNotIn(old[0].image.name, self.deleted_names())

    def test_replace_id_from_other_listing_rejected(self):
        old = self.fill(self.listing, MAX)
        foreign = self.fill(self.other, 1)[0]
        response = self.post(replace=foreign.id)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.ids(), {o.id for o in old})
        self.assertTrue(ListingImage.objects.filter(id=foreign.id).exists())
        self.storage.delete.assert_not_called()

    def test_replace_mixed_own_and_foreign_ids_rejected(self):
        old = self.fill(self.listing, MAX - 1)
        foreign = self.fill(self.other, 1)[0]
        response = self.post(replace=[old[0].id, foreign.id])
        self.assertEqual(response.status_code, 400)
        self.assertEqual(self.ids(), {o.id for o in old})
        self.assertTrue(ListingImage.objects.filter(id=foreign.id).exists())

    def test_replace_bad_values_rejected(self):
        old = self.fill(self.listing, MAX)
        for value in ("abc", "", "1.5", "999999", "99999999999999999999"):
            with self.subTest(value=value):
                response = self.post(replace=value)
                self.assertEqual(response.status_code, 400)
                self.assertEqual(self.ids(), {o.id for o in old})

    def test_sequential_replacements_at_limit(self):
        old = self.fill(self.listing, MAX)
        # two swaps of different photos both fit
        self.assertEqual(self.post(replace=old[0].id).status_code, 201)
        self.assertEqual(self.post(replace=old[1].id).status_code, 201)
        self.assertEqual(self.listing.images.count(), MAX)
        # a second swap of an already-replaced photo is rejected, nothing lost
        before = self.ids()
        self.assertEqual(self.post(replace=old[0].id).status_code, 400)
        self.assertEqual(self.ids(), before)
        # an append on the still-full listing is rejected
        self.assertEqual(self.post().status_code, 400)
        # two files replacing one photo would exceed the limit
        two = [open("tests/market/mock_image.jpg", "rb") for _ in range(2)]
        self.assertEqual(self.post(files=two, replace=old[2].id).status_code, 400)
        self.assertEqual(self.ids(), before)
        # the swapped photos' files were deleted, nothing else
        self.assertEqual(
            sorted(self.deleted_names()), sorted([old[0].image.name, old[1].image.name])
        )

    def test_replace_and_append_fill_to_limit(self):
        old = self.fill(self.listing, MAX - 1)
        # one swap and one append, in either order, end at the limit
        self.assertEqual(self.post(replace=old[0].id).status_code, 201)
        self.assertEqual(self.post().status_code, 201)
        self.assertEqual(self.listing.images.count(), MAX)
        self.assertEqual(self.post(replace=old[1].id).status_code, 201)
        self.assertEqual(self.listing.images.count(), MAX)

    def test_cannot_replace_on_someone_elses_listing(self):
        foreign = self.fill(self.other, 1)[0]
        response = self.post(listing=self.other, replace=foreign.id)
        self.assertEqual(response.status_code, 403)
        self.assertTrue(ListingImage.objects.filter(id=foreign.id).exists())
