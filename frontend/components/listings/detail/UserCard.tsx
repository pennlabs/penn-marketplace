import Image from "next/image";
import { Star } from "lucide-react";
import { User } from "@/lib/types";

interface Props {
  user: User;
  label: string;
}

export const UserCard = ({ user, label }: Props) => {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{label}</h2>
      <div className="flex items-center gap-3">
        <Image
          src="/images/default-avatar.png"
          alt={user.username}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div>
          <p className="font-semibold">
            {user.first_name} {user.last_name}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span>5.0</span> {/* TODO: add rating */}
          </div>
        </div>
      </div>
    </div>
  );
};
