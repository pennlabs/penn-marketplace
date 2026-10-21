import { useEffect, useState } from "react";
import { CarouselApi } from "@/components/ui/carousel";

export function useCarouselIndex(api: CarouselApi | undefined, initialIndex = 0) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);

  useEffect(() => {
    if (!api) return;
    const update = () => setSelectedIndex(api.selectedScrollSnap());
    update();
    api.on("select", update);
    api.on("reInit", update);
    return () => {
      api.off("select", update);
      api.off("reInit", update);
    };
  }, [api]);

  return selectedIndex;
}
