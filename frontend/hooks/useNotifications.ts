import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  deleteNotification,
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { Notification, PaginatedResponse } from "@/lib/types";

type NotificationList = InfiniteData<PaginatedResponse<Notification>>;

type NotificationsSnapshot = {
  list: NotificationList | undefined;
  count: number | undefined;
};

export function useNotifications(isOpen: boolean) {
  const queryClient = useQueryClient();
  const listKey = queryKeys.notificationsList();
  const countKey = queryKeys.notificationsUnreadCount();

  const countQuery = useQuery({
    queryKey: countKey,
    queryFn: getUnreadNotificationCount,
    // Matches the poll cadence; also stops a refetch right after the layout's hydrated prefetch.
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const listQuery = useInfiniteQuery({
    queryKey: listKey,
    queryFn: ({ pageParam }) => getNotifications({ pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => (lastPage.next ? allPages.length + 1 : undefined),
    enabled: isOpen,
  });

  const applyOptimistic = async (
    update: (list: NotificationList) => NotificationList,
    nextCount: (count: number) => number
  ): Promise<NotificationsSnapshot> => {
    await queryClient.cancelQueries({ queryKey: listKey });
    await queryClient.cancelQueries({ queryKey: countKey });

    const snapshot: NotificationsSnapshot = {
      list: queryClient.getQueryData<NotificationList>(listKey),
      count: queryClient.getQueryData<number>(countKey),
    };

    if (snapshot.list) {
      queryClient.setQueryData<NotificationList>(listKey, update(snapshot.list));
    }
    if (typeof snapshot.count === "number") {
      queryClient.setQueryData<number>(countKey, Math.max(0, nextCount(snapshot.count)));
    }

    return snapshot;
  };

  const mapRows = (
    list: NotificationList,
    updateRows: (rows: Notification[]) => Notification[]
  ): NotificationList => ({
    ...list,
    pages: list.pages.map((page) => ({ ...page, results: updateRows(page.results) })),
  });

  const rollback = (snapshot: NotificationsSnapshot | undefined) => {
    if (!snapshot) return;
    queryClient.setQueryData(listKey, snapshot.list);
    queryClient.setQueryData(countKey, snapshot.count);
  };

  const invalidateBoth = () => {
    queryClient.invalidateQueries({ queryKey: listKey });
    queryClient.invalidateQueries({ queryKey: countKey });
  };

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    // Suppress the generic error toast; onError shows a specific message.
    meta: { suppressErrorToast: true },
    onMutate: (id: number) => {
      const now = new Date().toISOString();
      let wasUnread = false;

      return applyOptimistic(
        (list) =>
          mapRows(list, (rows) =>
            rows.map((notification) => {
              if (notification.id === id && notification.read_at === null) {
                wasUnread = true;
                return { ...notification, read_at: now };
              }
              return notification;
            })
          ),
        (count) => (wasUnread ? count - 1 : count)
      );
    },
    onError: (_error, _id, snapshot) => {
      rollback(snapshot);
      toast.error("Couldn't mark the notification as read.");
    },
    onSettled: invalidateBoth,
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    meta: { suppressErrorToast: true },
    onMutate: () => {
      const now = new Date().toISOString();

      return applyOptimistic(
        (list) =>
          mapRows(list, (rows) =>
            rows.map((notification) =>
              notification.read_at === null ? { ...notification, read_at: now } : notification
            )
          ),
        () => 0
      );
    },
    onError: (_error, _variables, snapshot) => {
      rollback(snapshot);
      toast.error("Couldn't mark all notifications as read.");
    },
    onSettled: invalidateBoth,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    meta: { suppressErrorToast: true },
    onMutate: (id: number) => {
      let wasUnread = false;

      return applyOptimistic(
        (list) => ({
          ...list,
          pages: list.pages.map((page) => ({
            ...page,
            count: Math.max(0, page.count - 1),
            results: page.results.filter((notification) => {
              if (notification.id === id) {
                wasUnread = notification.read_at === null;
                return false;
              }
              return true;
            }),
          })),
        }),
        (count) => (wasUnread ? count - 1 : count)
      );
    },
    onError: (_error, _id, snapshot) => {
      rollback(snapshot);
      toast.error("Couldn't delete the notification.");
    },
    onSettled: invalidateBoth,
  });

  return {
    unreadCount: countQuery.data ?? 0,
    notifications: listQuery.data?.pages.flatMap((page) => page.results) ?? [],
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    markAsRead: (id: number) => markReadMutation.mutate(id),
    markAllAsRead: () => markAllReadMutation.mutate(),
    isMarkingAllRead: markAllReadMutation.isPending,
    deleteNotification: (id: number) => deleteMutation.mutate(id),
    hasNextPage: listQuery.hasNextPage,
    isFetchingNextPage: listQuery.isFetchingNextPage,
    fetchNextPage: listQuery.fetchNextPage,
  };
}
