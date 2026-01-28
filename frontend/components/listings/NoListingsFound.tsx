import { Home, Package } from "lucide-react";

interface Props {
  type: "items" | "sublets";
}

export const NoListingsFound = ({ type }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16">
      <div className="mb-4 rounded-full bg-gray-100 p-6">
        {type === "items" ? (
          <Package className="h-12 w-12 text-gray-400" />
        ) : (
          <Home className="h-12 w-12 text-gray-400" />
        )}
      </div>
      <h3 className="mb-2 text-xl font-semibold text-gray-900">
        No {type === "items" ? "items" : "sublets"} found
      </h3>
      <p className="max-w-md text-center text-gray-600">
        {`Try adjusting your filters or check back later for new ${type}`}
      </p>
    </div>
  );
};
