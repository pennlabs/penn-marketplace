"use client";

import Image from "next/image";
import { useState } from "react";
import { ListingImageViewer } from "@/components/listings/detail/ListingImageViewer";
import { Carousel, CarouselApi, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { useCarouselIndex } from "@/hooks/useCarouselIndex";
import { cn } from "@/lib/utils";

const DEFAULT_IMAGE = "/images/default-image.jpg";
const MAX_GRID_IMAGES = 5;

interface Props {
  images: string[];
}

const SIDE_IMAGE_SPANS: Record<number, string[]> = {
  2: ["col-span-2 row-span-2"],
  3: ["col-span-2", "col-span-2"],
  4: ["", "", "col-span-2"],
  5: ["", "", "", ""],
};

export const ListingImageGallery = ({ images }: Props) => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerStartIndex, setViewerStartIndex] = useState(0);
  const [mobileCarouselApi, setMobileCarouselApi] = useState<CarouselApi>();
  const mobileIndex = useCarouselIndex(mobileCarouselApi);

  if (images.length === 0) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 md:aspect-auto md:h-96">
        <Image src={DEFAULT_IMAGE} alt="No image available" fill className="object-cover" />
      </div>
    );
  }

  const gridImages = images.slice(0, MAX_GRID_IMAGES);
  const hiddenCount = images.length - gridImages.length;
  const sideSpans = SIDE_IMAGE_SPANS[gridImages.length];

  const openViewer = (index: number) => {
    setViewerStartIndex(index);
    setIsViewerOpen(true);
  };

  return (
    <>
      <Carousel setApi={setMobileCarouselApi} className="overflow-hidden rounded-2xl md:hidden">
        <CarouselContent className="ml-0">
          {images.map((image, idx) => (
            <CarouselItem key={idx} className="pl-0">
              <button
                type="button"
                onClick={() => openViewer(idx)}
                aria-label={`View photo ${idx + 1} of ${images.length}`}
                className="relative block aspect-[4/3] w-full overflow-hidden bg-gray-100"
              >
                <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
        {images.length > 1 && (
          <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {mobileIndex + 1} / {images.length}
          </span>
        )}
      </Carousel>

      <div
        className={cn(
          "hidden h-96 overflow-hidden rounded-2xl md:grid",
          gridImages.length > 1 && "grid-cols-4 grid-rows-2 gap-2"
        )}
      >
        {gridImages.map((image, idx) => {
          const isMain = idx === 0;
          const isOnlyImage = gridImages.length === 1;
          const isLastWithMore = idx === gridImages.length - 1 && hiddenCount > 0;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => openViewer(idx)}
              aria-label={
                isLastWithMore
                  ? `View all ${images.length} photos`
                  : `View photo ${idx + 1} of ${images.length}`
              }
              className={cn(
                "group relative cursor-pointer overflow-hidden bg-gray-100",
                isMain && gridImages.length > 1 && "col-span-2 row-span-2",
                !isMain && sideSpans[idx - 1]
              )}
            >
              {isOnlyImage ? (
                <ContainedImage src={image} sizes="(min-width: 1024px) 1024px, 100vw" />
              ) : (
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes={isMain ? "50vw" : "25vw"}
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
              )}
              {isLastWithMore && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-2xl font-medium text-white">
                  +{hiddenCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent
          showCloseButton={false}
          className="top-0 left-0 block h-dvh w-screen max-w-none translate-x-0 translate-y-0 rounded-none border-none bg-black p-0 shadow-none sm:max-w-none"
        >
          <DialogTitle className="sr-only">Listing photos</DialogTitle>
          <DialogDescription className="sr-only">
            Use the left and right arrow keys to browse photos.
          </DialogDescription>
          <ListingImageViewer images={images} startIndex={viewerStartIndex} />
        </DialogContent>
      </Dialog>
    </>
  );
};

interface ContainedImageProps {
  src: string;
  sizes: string;
}

const ContainedImage = ({ src, sizes }: ContainedImageProps) => {
  return (
    <>
      <Image
        src={src}
        alt=""
        fill
        sizes={sizes}
        aria-hidden="true"
        className="scale-110 object-cover opacity-60 blur-2xl"
      />
      <Image src={src} alt="" fill sizes={sizes} className="object-contain" />
    </>
  );
};
