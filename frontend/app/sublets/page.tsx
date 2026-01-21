import { getCurrentUser, getSublets } from "@/lib/actions";
import { PageHeader } from "@/components/common/PageHeader";
import { SubletFilters } from "@/components/filters/SubletFilters";
import { ListingsGrid } from "@/components/listings/ListingsGrid";

export default async function SubletsPage() {
  const [sublets, currentUser] = await Promise.all([
    getSublets({ pageParam: 1 }),
    getCurrentUser(),
  ]);

  return (
    <div className="w-full space-y-6 mx-auto container max-w-[96rem] px-12 pt-6">
      <PageHeader title="Browse Sublets" description="Find your perfect housing solution at Penn" />
      <SubletFilters />
      <ListingsGrid type="sublets" listings={sublets} currentUser={currentUser} />
    </div>
  );
}
