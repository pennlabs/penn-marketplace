import Image from "next/image";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";

interface Props {
  user: User;
}

export const ProfileHeader = ({ user }: Props) => {
  const fullName = `${user.first_name} ${user.last_name}`;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4 sm:gap-6">
          <Image
            src="/images/default-avatar.png"
            alt={fullName}
            width={80}
            height={80}
            className="rounded-full"
          />
          <div className="space-y-1">
            <h1 className="text-xl font-bold sm:text-2xl">{fullName}</h1>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              {/* TODO: replace with actual user rating */}
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-medium">5.0</span>
              <span className="text-gray-400">(10 reviews)</span>
            </div>
          </div>
        </div>
        <Button variant="outline">Edit Info</Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-x-12 gap-y-3 text-sm">
        <div>
          <p className="text-brand font-medium">email</p>
          <p className="text-gray-700">{user.email}</p>
        </div>
        <div>
          <p className="text-brand font-medium">phone number</p>
          <p className="text-gray-700">{user.phone_number || "Not set"}</p>
        </div>
        <div>
          <p className="text-brand font-medium">notification method</p>
          {/* TODO: replace with actual notification preference */}
          <p className="text-gray-700">Email</p>
        </div>
      </div>
    </div>
  );
};
