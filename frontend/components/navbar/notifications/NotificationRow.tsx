"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn, formatRelativeTime } from "@/lib/utils";
import { Notification } from "@/lib/types";
import { renderNotification } from "@/components/navbar/notifications/notificationRenderers";

interface Props {
  notification: Notification;
  onMarkRead: (id: number) => void;
  onDelete: (id: number) => void;
  onNavigate: () => void;
}

export const NotificationRow = ({ notification, onMarkRead, onDelete, onNavigate }: Props) => {
  const { text, href, icon: Icon } = renderNotification(notification);
  const isUnread = notification.read_at === null;
  const timeLabel = formatRelativeTime(notification.created_at);

  const handleNavigate = () => {
    if (isUnread) onMarkRead(notification.id);
    onNavigate();
  };

  const handleDelete = () => onDelete(notification.id);

  return (
    <li className={cn("flex items-start gap-2 px-3 py-3", isUnread && "bg-notification-unread")}>
      <Link
        href={href}
        onClick={handleNavigate}
        className={cn(
          "group -m-1 flex flex-1 items-start gap-3 rounded-md p-1 transition-colors",
          isUnread ? "hover:bg-notification-unread-hover" : "hover:bg-accent"
        )}
      >
        <span className="bg-muted text-muted-foreground mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-foreground line-clamp-2 text-sm leading-snug break-words">
            {text}
          </span>
          <span className="text-muted-foreground mt-0.5 block text-xs">{timeLabel}</span>
        </span>
        {isUnread && <span className="sr-only">Unread</span>}
      </Link>

      <Button
        variant="ghost"
        size="icon-sm"
        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        onClick={handleDelete}
        aria-label="Delete notification"
        title="Delete notification"
      >
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
};
