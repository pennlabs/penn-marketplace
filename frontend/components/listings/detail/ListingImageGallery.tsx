"use client";

import Image from "next/image";
import { useState } from "react";
import { cn, mediaUrl } from "@/lib/utils";
import type { ListingImage } from "@/lib/types";

const DEFAULT_IMAGE = "/images/default-image.jpg";

interface Props {
  images: ListingImage[];
}

export const ListingImageGallery = ({ images }: Props) => {
  const [selectedImage, setSelectedImage] = useState(0);

  const selectedUrl = images[selectedImage]
    ? mediaUrl(images[selectedImage].image_url)
    : DEFAULT_IMAGE;

  return (
    <div className="space-y-4">
      <div className="relative h-[400px] overflow-hidden rounded-2xl md:h-[450px] lg:h-[500px]">
        {/* blurred background */}
        <Image
          src={selectedUrl}
          alt="Background"
          fill
          className="scale-110 object-cover opacity-50 blur-2xl"
          aria-hidden="true"
        />

        {/* main selected image */}
        <div className="relative flex h-full w-full items-center justify-center">
          <Image src={selectedUrl} alt="Listing image" fill className="object-contain" />
        </div>
      </div>

      {/* thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.length > 1 &&
          images.map((image, idx) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(idx)}
              className={cn(
                "relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border-2",
                selectedImage === idx ? "border-primary" : "border-transparent"
              )}
            >
              <Image
                src={mediaUrl(image.image_url)}
                alt={`Thumbnail ${idx + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
      </div>
    </div>
  );
};
