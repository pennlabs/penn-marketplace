import { getSublets } from "@/lib/actions";
import { PageHeader } from "@/components/common/PageHeader";
import { ListingsGrid } from "@/components/Listings/ListingsGrid";

export default async function SubletsPage() {
  const sublets = await getSublets({ pageParam: 1 });

  return (
    <div className="w-full space-y-6 mx-auto container max-w-[96rem] px-12 pt-6">
      <PageHeader title="Browse Sublets" description="Find your perfect housing solution at Penn" />
      <ListingsGrid type="sublets" listings={sublets} />
    </div>
  );
}
