"use client";

import Image from "next/image";
import { useState } from "react";
import defaultImage from "@/public/images/default-image.jpg";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
}

export const ListingImageGallery = ({ images }: Props) => {
  const [selectedImage, setSelectedImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative h-[400px] md:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden">
        {/* blurred background */}
        <Image
          src={images[selectedImage] || defaultImage}
          alt="Background"
          fill
          className="object-cover blur-2xl scale-110 opacity-50"
          aria-hidden="true"
        />

        {/* main selected image */}
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={images[selectedImage] || defaultImage}
            alt="Listing image"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {images.map((image, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedImage(idx)}
            className={cn(
              "relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border-2",
              selectedImage === idx ? "border-primary" : "border-transparent"
            )}
          >
            <Image src={image} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}