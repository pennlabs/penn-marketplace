import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const SearchBar = () => {
  return (
    <div className="relative w-full md:max-w-md">
      <Search className="text-muted-foreground absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform" />
      <Input type="text" placeholder="Search Listings" className="h-11 w-full pl-12 text-base" />
    </div>
  );
};
