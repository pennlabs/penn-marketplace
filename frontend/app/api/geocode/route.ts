import { NextRequest, NextResponse } from "next/server";
import type { PhotonReponse, AddressResult, PhotonFeature } from "@/lib/types";

function photonFeatureToAddressResult(feature: PhotonFeature): AddressResult {
  const props = feature.properties;
  const [lon, lat] = feature.geometry.coordinates;

  const addressParts = [
    props.housenumber && props.street
      ? `${props.housenumber} ${props.street}`
      : (props.street ?? props.name),
    props.city,
    [props.state, props.postcode].filter(Boolean).join(" "),
  ].filter(Boolean);

  const displayName = addressParts.join(", ");

  return {
    placeId: props.osm_id,
    lat: lat.toString(),
    lon: lon.toString(),
    displayName,
    address: {
      housenumber: props.housenumber,
      road: props.street,
      city: props.city,
      state: props.state,
      postCode: props.postcode,
      country: props.country,
      countryCode: props.countrycode,
    },
  };
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || query.trim().length < 3) {
    return NextResponse.json([]);
  }

  try {
    // Philadelphia bounding box
    const bbox = "-75.28,39.87,-75.0,40.14";

    const params = new URLSearchParams({
      q: query,
      limit: "5", // maximum number of results returned
      lang: "en",
      bbox: bbox,
    });

    const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: PhotonReponse = await response.json();
    const results = data.features.map(photonFeatureToAddressResult);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Geocode API error:", error);
    return NextResponse.json({ error: "Failed to fetch addresses" }, { status: 500 });
  }
}
