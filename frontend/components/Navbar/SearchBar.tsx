import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const SearchBar = () => {
  return (
    <div className="relative w-full md:max-w-md">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <Input 
        type="text" 
        placeholder="Search Listings" 
        className="pl-12 h-11 w-full text-base"
      />
    </div>
  );
};