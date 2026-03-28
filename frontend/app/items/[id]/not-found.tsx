import Link from "next/link";

export default function ItemNotFound() {
  return (
    <div className="flex w-full flex-col items-center space-y-4 py-24 text-center">
      <h2 className="text-lg font-semibold">Listing not found</h2>
      <p className="text-muted-foreground text-sm">
        This listing may have been removed or doesn&apos;t exist.
      </p>
      <Link
        href="/items"
        className="bg-brand hover:bg-brand-hover rounded-md px-4 py-2 text-sm text-white"
      >
        Back to items
      </Link>
    </div>
  );
}
