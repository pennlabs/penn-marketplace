import { NextRequest, NextResponse } from "next/server";
import type { PhotonReponse, AddressResult, PhotonFeature } from "@/lib/types";

function photonFeatureToAddressResult(feature: PhotonFeature): AddressResult {
  const props = feature.properties;
  const [lon, lat] = feature.geometry.coordinates;

  const displayParts: string[] = [];

  if (props.housenumber && props.street) {
    displayParts.push(`${props.housenumber} ${props.street}`);
  } else if (props.street) {
    displayParts.push(props.street);
  } else if (props.name) {
    displayParts.push(props.name);
  }

  if (props.city) displayParts.push(props.city);
  if (props.state) displayParts.push(props.state);

  const displayName = `${displayParts.join(", ")} ${props.postcode ? props.postcode : ""}`;

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
      limit: "5",
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
