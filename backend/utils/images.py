import io
import os

from django.core.files.base import ContentFile
from PIL import Image, ImageOps


# ~6000x4000 (24MP phone default). PNG/WebP decode at full size (~100MB RGBA at
# the cap) before shrinking; JPEG uses draft() and stays small.
# ponytail: per-request cap only, add a bounded worker pool if concurrent uploads
# exhaust worker memory
MAX_PIXELS = 25_000_000


def resize_image(file, max_size=1600, quality=85):
    """
    Shrinks an uploaded image to fit within max_size x max_size (keeping aspect
    ratio) and re-encodes it as WebP. Returns a ContentFile ready for an ImageField.
    Raises ValueError if the image's dimensions exceed MAX_PIXELS.
    """
    # reads only the header; pixels aren't decoded yet. formats= keeps Pillow's
    # other parsers (EPS -> Ghostscript, PSD, TIFF...) off the upload path
    img = Image.open(file, formats=["JPEG", "PNG", "WEBP"])
    if img.width * img.height > MAX_PIXELS:
        raise ValueError("Image dimensions are too large.")
    # shrink first so exif_transpose rotates the small copy, not the full-size one
    img.thumbnail((max_size, max_size))  # no-op if already smaller
    # phone photos store rotation in EXIF; bake it in since WebP output drops it
    img = ImageOps.exif_transpose(img)

    output = io.BytesIO()
    img.convert("RGBA" if img.has_transparency_data else "RGB").save(
        output, format="WEBP", quality=quality
    )
    name = os.path.splitext(os.path.basename(file.name))[0] + ".webp"
    return ContentFile(output.getvalue(), name=name)
