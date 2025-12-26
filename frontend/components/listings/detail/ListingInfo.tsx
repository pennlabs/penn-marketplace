import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Props {
  title: string;
  price: number;
  description: string;
  category?: string;
  condition?: string;
  priceLabel?: string;
}

export const ListingInfo = ({
  title,
  price,
  priceLabel,
  description,
  category,
  condition,
}: Props) => {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-baseline">
        <p className="text-3xl font-bold text-brand">${price.toLocaleString()}</p>
        {priceLabel && <p className="text-lg text-gray-600">{priceLabel}</p>}
      </div>
      <div className="flex items-center gap-2">
        {category && <Badge variant="secondary">{category}</Badge>}
        {condition && <Badge variant="secondary">{condition}</Badge>}
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  );
}