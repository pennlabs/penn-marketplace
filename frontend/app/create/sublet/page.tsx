import Link from "next/link";
import { BackButton } from "@/components/listings/detail/BackButton";
import { SubletForm } from "@/components/listings/form/SubletForm";

export default function CreateSubletPage() {
  return (
    <>
      <Link href="/sublets">
        <BackButton />
      </Link>

      <h1 className="mb-8 pt-2 text-3xl font-bold">New Sublet</h1>

      <SubletForm />
    </>
  );
}
