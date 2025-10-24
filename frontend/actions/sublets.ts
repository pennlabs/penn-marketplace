import { FETCH_LISTINGS_LIMIT } from "@/constants/listings";

export default async function getSublets({ pageParam = 1 }: { pageParam: unknown }) {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_page=${pageParam}&_limit=${FETCH_LISTINGS_LIMIT}`
  );
  return res.json();
}
