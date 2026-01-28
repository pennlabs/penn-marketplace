import { ListingDetail } from "@/components/listings/detail/ListingDetail";
import { getListing } from "@/lib/actions";

export default async function SubletPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sublet = await getListing(id);

  return <ListingDetail listing={sublet} />;
}
