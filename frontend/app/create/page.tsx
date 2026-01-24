import Link from "next/link";
import { Package, Home } from "lucide-react";

export default function CreatePage() {
  return (
    <div className="w-full mx-auto container max-w-[96rem] px-12 pt-6">
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h1 className="text-3xl font-bold mb-12 underline underline-offset-8 decoration-2">
          Choose Listing Type
        </h1>

        <div className="flex gap-8">
          <Link href="/create/item">
            <div className="flex flex-col items-center justify-center w-64 h-48 border border-gray-200 rounded-xl bg-white hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-gray-600" />
              </div>
              <span className="text-lg font-medium">Items</span>
            </div>
          </Link>

          <Link href="/create/sublet">
            <div className="flex flex-col items-center justify-center w-64 h-48 border border-gray-200 rounded-xl bg-white hover:shadow-lg hover:border-gray-300 transition-all cursor-pointer">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Home className="w-8 h-8 text-gray-600" />
              </div>
              <span className="text-lg font-medium">Sublet</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}