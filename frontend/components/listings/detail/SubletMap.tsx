"use client";

import dynamic from "next/dynamic";

interface Props {
  latitude: number;
  longitude: number;
}

const LazyMap = dynamic(
  () =>
    import("@/components/listings/detail/SubletMapContent").then((m) => m.SubletMapContent),
  { ssr: false },
);

export const SubletMap = ({ latitude, longitude }: Props) => {
  return <LazyMap latitude={latitude} longitude={longitude} />;
};
