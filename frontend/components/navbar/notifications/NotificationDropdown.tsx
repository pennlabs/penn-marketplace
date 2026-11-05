"use client";

import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Notification } from "@/lib/types";
import { NotificationRow } from "@/components/navbar/notifications/NotificationRow";

interface Props {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isError: boolean;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  isMarkingAllRead: boolean;
  onDelete: (id: number) => void;
  onNavigate: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
}

export const NotificationDropdown = ({
  notifications,
  unreadCount,
  isLoading,
  isError,
  onMarkRead,
  onMarkAllRead,
  isMarkingAllRead,
  onDelete,
  onNavigate,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: Props) => {
  const { ref: loadMoreRef, inView } = useInView();
  useEffect(() => {
    if (inView) onLoadMore();
  }, [inView, onLoadMore]);

  return (
    <>
      <div className="flex items-center justify-between border-b px-3 py-2">
        <h2 className="text-sm font-medium">Notifications</h2>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto gap-1.5 px-2 py-1 text-xs"
            onClick={() => onMarkAllRead()}
            disabled={isMarkingAllRead}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Spinner />
        </div>
      ) : isError ? (
        <div className="text-muted-foreground px-3 py-10 text-center text-sm">
          Couldn&apos;t load notifications. Try again in a moment.
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-muted-foreground px-3 py-10 text-center text-sm">
          You&apos;re all caught up
        </div>
      ) : (
        <ul className="max-h-96 divide-y overflow-y-auto">
          {notifications.map((notification) => (
            <NotificationRow
              key={notification.id}
              notification={notification}
              onMarkRead={onMarkRead}
              onDelete={onDelete}
              onNavigate={onNavigate}
            />
          ))}
          {hasNextPage && (
            <li ref={loadMoreRef} className="flex justify-center p-3">
              {isFetchingNextPage && <Spinner className="h-4 w-4" />}
            </li>
          )}
        </ul>
      )}
    </>
  );
};
