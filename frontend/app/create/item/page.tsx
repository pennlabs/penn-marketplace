import Link from "next/link";
import { BackButton } from "@/components/listings/detail/BackButton";
import { ItemForm } from "@/components/listings/form/ItemForm";

export default function CreateItemPage() {
  return (
    <div className="container mx-auto w-full max-w-[96rem] px-12 pt-4 pb-12">
      <Link href="/items">
        <BackButton />
      </Link>

      <h1 className="mb-8 pt-2 text-3xl font-bold">New Item</h1>

      <ItemForm />
    </div>
  );
}
