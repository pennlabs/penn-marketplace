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
    <div className="container mx-auto w-full max-w-[96rem] space-y-6 px-12 pt-6">
      <PageHeader title="Browse Sublets" description="Find your perfect housing solution at Penn" />
      <SubletFilters />
      <ListingsGrid type="sublets" listings={sublets} currentUser={currentUser} />
    </div>
  );
}
