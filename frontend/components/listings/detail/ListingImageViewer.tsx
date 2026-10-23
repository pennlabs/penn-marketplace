"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { DialogClose } from "@/components/ui/dialog";
import { useCarouselIndex } from "@/hooks/useCarouselIndex";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  startIndex: number;
}

const ARROW_BUTTON_CLASS =
  "hidden size-12 border-none bg-white/10 text-white hover:bg-white/20 hover:text-white disabled:opacity-30 md:inline-flex [&_svg]:size-6";

export const ListingImageViewer = ({ images, startIndex }: Props) => {
  const [api, setApi] = useState<CarouselApi>();
  const currentIndex = useCarouselIndex(api, startIndex);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!api) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        api.scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        api.scrollNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [api]);

  return (
    <Carousel opts={{ startIndex }} setApi={setApi} className="h-full">
      <CarouselContent className="ml-0">
        {images.map((image, idx) => (
          <CarouselItem key={idx} className="relative h-dvh pl-0">
            <div className="absolute inset-x-0 inset-y-16 md:inset-x-[max(6rem,calc((100%_-_64rem)/2))] md:inset-y-[10vh]">
              <Image
                src={image}
                alt={`Photo ${idx + 1} of ${images.length}`}
                fill
                sizes="100vw"
                className="object-contain"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {hasMultiple && (
        <>
          <CarouselPrevious variant="ghost" className={cn(ARROW_BUTTON_CLASS, "left-6")} />
          <CarouselNext variant="ghost" className={cn(ARROW_BUTTON_CLASS, "right-6")} />
          <span className="absolute bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 text-sm font-medium text-white">
            {currentIndex + 1} / {images.length}
          </span>
        </>
      )}

      <DialogClose
        aria-label="Close photos"
        className="absolute top-[max(1rem,env(safe-area-inset-top))] right-4 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="h-5 w-5" />
      </DialogClose>
    </Carousel>
  );
};
