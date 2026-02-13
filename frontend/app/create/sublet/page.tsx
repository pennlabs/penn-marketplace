import Link from "next/link";
import { BackButton } from "@/components/listings/detail/BackButton";

export default function CreateSubletPage() {
  return (
    <div className="container mx-auto w-full max-w-[96rem] px-12 pt-6 pb-12">
      <Link href="/sublets">
        <BackButton />
      </Link>

      <h1 className="mb-8 pt-2 text-3xl font-bold">New Sublet</h1>
    </div>
  );
}
