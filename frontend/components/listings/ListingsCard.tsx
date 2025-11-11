import Image from "next/image";
import Link from "next/link";
import { ListingCondition } from "@/lib/types";
import { ListingCategory } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import defaultImage from "@/public/images/default-image.jpg";

type Props = {
  price: number;
  title: string;
  previewImageUrl?: string;
  listingCategory: ListingCategory;
  condition: ListingCondition;
  href: string;
}

export const ListingsCard = ({
  price,
  title,
  previewImageUrl,
  listingCategory,
  condition,
  href,
}: Props) => {
  return (
    <Link href={href} className="w-full border rounded-md overflow-hidden flex flex-col">
      <div className="relative w-full aspect-[300/300]">
        <Image
          src={previewImageUrl || defaultImage}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4 flex flex-col gap-1 h-32">
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <span>{listingCategory}</span>
          <span>•</span>
          <span>{condition}</span>
        </div>
        <h1 className="font-semibold text-lg truncate flex-1">{title}</h1>
        <p className="font-bold text-xl">{formatPrice(price)}</p>
      </div>
    </Link>
  )
}