import { PublicUser } from "@/lib/types";
import { formatDate } from "@/lib/utils";

function getInitials(displayName: string): string {
  const lastInitial = displayName.endsWith(".") ? displayName.charAt(displayName.length - 2) : "";
  return `${displayName.charAt(0)}${lastInitial}`.toUpperCase();
}

interface Props {
  user: PublicUser;
}

export const ProfileHeader = ({ user }: Props) => {
  return (
    <div className="flex items-center gap-4">
      <div
        className="bg-brand flex size-16 shrink-0 items-center justify-center rounded-full text-xl font-semibold text-white"
        aria-hidden="true"
      >
        {getInitials(user.display_name)}
      </div>
      <div>
        <h1 className="text-2xl font-bold">{user.display_name}</h1>
        <p className="text-gray-600">
          Member since {formatDate(user.date_joined, { month: "short", year: "numeric" })}
        </p>
      </div>
    </div>
  );
};
