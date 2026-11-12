import { PublicUser } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface Props {
  seller: PublicUser;
  ownerLabel: string;
  createdAt: string;
}

export const ListingDetailsSection = ({ seller, ownerLabel, createdAt }: Props) => {
  const details = [
    {
      label: ownerLabel,
      value: seller.display_name,
    },
    {
      label: "Listing Date",
      value: formatDate(createdAt, { month: "long", day: "numeric", year: "numeric" }),
    },
  ];

  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-semibold">Details</h2>
      <dl className="flex flex-wrap gap-x-16 gap-y-4">
        {details.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-sm text-gray-500">{label}</dt>
            <dd className="text-sm">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
