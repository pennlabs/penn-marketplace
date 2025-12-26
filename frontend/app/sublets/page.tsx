import { getSublets } from "@/lib/actions";
import { ListingsGrid } from "@/components/listings/ListingsGrid";

export default async function SubletsPage() {
  const sublets = await getSublets({ pageParam: 1 });

  return (
    <div className="w-full space-y-6 mx-auto container max-w-[96rem] px-12 pt-6">
      <ListingsGrid type="sublets" listings={sublets} />
    </div>
  );
}
