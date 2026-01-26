import { getCurrentUser, getItems } from "@/lib/actions";
import { PageHeader } from "@/components/common/PageHeader";
import { ItemFilters } from "@/components/filters/ItemFilters";
import { ListingsGrid } from "@/components/listings/ListingsGrid";

export default async function ItemsPage() {
  const [items, currentUser] = await Promise.all([getItems({ pageParam: 1 }), getCurrentUser()]);

  return (
    <div className="container mx-auto w-full max-w-[96rem] space-y-6 px-12 pt-6">
      <PageHeader title="Browse Items" description="Discover the latest items on sale at Penn" />
      <ItemFilters />
      <ListingsGrid type="items" listings={items} currentUser={currentUser} />
    </div>
  );
}
