import Link from "next/link";
import { BackButton } from "@/components/listings/detail/BackButton";
import { ItemForm } from "@/components/listings/form/ItemForm";

export default function CreateItemPage() {
  return (
    <>
      <Link href="/items">
        <BackButton />
      </Link>

      <h1 className="mb-8 pt-2 text-3xl font-bold">New Item</h1>

      <ItemForm />
    </>
  );
}
