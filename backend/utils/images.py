import io
import os

from django.core.files.base import ContentFile
from PIL import Image, ImageOps


def resize_image(file, max_size=1600, quality=85):
    """
    Shrinks an uploaded image to fit within max_size x max_size (keeping aspect
    ratio) and re-encodes it as WebP. Returns a ContentFile ready for an ImageField.
    """
    img = Image.open(file)
    # phone photos store rotation in EXIF; bake it in since WebP output drops it
    img = ImageOps.exif_transpose(img)
    img.thumbnail((max_size, max_size))  # no-op if already smaller

    output = io.BytesIO()
    img.convert("RGBA" if img.has_transparency_data else "RGB").save(
        output, format="WEBP", quality=quality
    )
    name = os.path.splitext(os.path.basename(file.name))[0] + ".webp"
    return ContentFile(output.getvalue(), name=name)
