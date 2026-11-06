import json
import os
import subprocess
import sys

from django.test import SimpleTestCase


class TestStorageSettings(SimpleTestCase):
    def load_settings(self, module, **variables):
        env = os.environ.copy()
        for name in (
            "AWS_STORAGE_BUCKET_NAME",
            "AWS_DEV_STORAGE_BUCKET_NAME",
            "USE_S3",
        ):
            env.pop(name, None)
        env.update(
            DJANGO_SETTINGS_MODULE=f"config.settings.{module}",
            DATABASE_URL="sqlite:///:memory:",
            PYTHONDONTWRITEBYTECODE="1",
            **variables,
        )
        # Fresh processes prevent Django's settings cache leaking between cases.
        return subprocess.run(
            [
                sys.executable,
                "-c",
                "import json; from django.conf import settings; "
                "print(json.dumps({"
                "'bucket': settings.AWS_STORAGE_BUCKET_NAME, "
                "'storages': settings.STORAGES}))",
            ],
            env=env,
            capture_output=True,
            text=True,
        )

    def test_development_defaults_to_local_even_with_production_bucket(self):
        for variables in ({}, {"AWS_DEV_STORAGE_BUCKET_NAME": ""}):
            with self.subTest(variables=variables):
                result = self.load_settings(
                    "development",
                    AWS_STORAGE_BUCKET_NAME="production-bucket",
                    USE_S3="1",
                    **variables,
                )
                self.assertEqual(result.returncode, 0, result.stderr)
                settings = json.loads(result.stdout)
                self.assertEqual(settings["bucket"], "")
                self.assertEqual(
                    settings["storages"]["default"]["BACKEND"],
                    "django.core.files.storage.FileSystemStorage",
                )

    def test_development_uses_only_development_bucket_for_s3(self):
        result = self.load_settings(
            "development",
            AWS_DEV_STORAGE_BUCKET_NAME="development-bucket",
            AWS_STORAGE_BUCKET_NAME="production-bucket",
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        settings = json.loads(result.stdout)
        self.assertEqual(settings["bucket"], "development-bucket")
        self.assertEqual(
            settings["storages"]["default"]["BACKEND"],
            "storages.backends.s3.S3Storage",
        )

    def test_production_always_uses_its_own_bucket_for_s3(self):
        result = self.load_settings(
            "production",
            AWS_STORAGE_BUCKET_NAME="production-bucket",
            AWS_DEV_STORAGE_BUCKET_NAME="development-bucket",
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        settings = json.loads(result.stdout)
        self.assertEqual(settings["bucket"], "production-bucket")
        self.assertEqual(
            settings["storages"]["default"]["BACKEND"],
            "storages.backends.s3.S3Storage",
        )

    def test_production_requires_its_bucket_even_with_development_bucket(self):
        for variables in ({}, {"AWS_STORAGE_BUCKET_NAME": ""}):
            with self.subTest(variables=variables):
                result = self.load_settings(
                    "production",
                    AWS_DEV_STORAGE_BUCKET_NAME="development-bucket",
                    **variables,
                )
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(
                    "ImproperlyConfigured: "
                    "AWS_STORAGE_BUCKET_NAME is required in production.",
                    result.stderr,
                )
