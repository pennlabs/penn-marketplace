import { Home, Package } from "lucide-react";

interface Props {
  type: "items" | "sublets";
}

export const NoListingsFound = ({ type }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="rounded-full bg-gray-100 p-6 mb-4">
        {type === "items" ? (
          <Package className="w-12 h-12 text-gray-400" />
        ) : (
          <Home className="w-12 h-12 text-gray-400" />
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        No {type === "items" ? "items" : "sublets"} found
      </h3>
      <p className="text-gray-600 text-center max-w-md">
        {`Try adjusting your filters or check back later for new ${type}`}
      </p>
    </div>
  );
}