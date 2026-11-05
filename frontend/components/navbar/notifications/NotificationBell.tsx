"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { NotificationDropdown } from "@/components/navbar/notifications/NotificationDropdown";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    unreadCount,
    notifications,
    isLoading,
    isError,
    markAsRead,
    markAllAsRead,
    isMarkingAllRead,
    deleteNotification,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useNotifications(isOpen);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative cursor-pointer"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="bg-brand absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] leading-none font-medium text-white"
              aria-hidden="true"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 max-w-[calc(100vw-2rem)] overflow-hidden p-0">
        <NotificationDropdown
          notifications={notifications}
          unreadCount={unreadCount}
          isLoading={isLoading}
          isError={isError}
          onMarkRead={markAsRead}
          onMarkAllRead={markAllAsRead}
          isMarkingAllRead={isMarkingAllRead}
          onDelete={deleteNotification}
          onNavigate={() => setIsOpen(false)}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={fetchNextPage}
        />
      </PopoverContent>
    </Popover>
  );
};
