import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  message: string;
  action?: ReactNode;
}

export const EmptyState = ({ icon: Icon, message, action }: Props) => {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-4 rounded-full bg-gray-100 p-6">
        <Icon className="h-12 w-12 text-gray-400" />
      </div>
      <p className="max-w-md text-gray-600">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
