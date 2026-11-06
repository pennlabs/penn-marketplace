import { Tag, type LucideIcon } from "lucide-react";
import { Notification, NotificationType } from "@/lib/types";

export type RenderedNotification = {
  text: string;
  href: string;
  icon: LucideIcon;
};

const renderers: {
  [K in NotificationType]: (
    data: Extract<Notification, { type: K }>["data"]
  ) => RenderedNotification;
} = {
  offer_received: (data) => ({
    text: `New offer on ${data.listing_title}`,
    href: `/items/${data.listing_id}`,
    icon: Tag,
  }),
};

export function renderNotification(notification: Notification): RenderedNotification {
  // The cast is safe: the key selects the renderer whose `data` matches this notification.
  const render = renderers[notification.type] as (
    data: Notification["data"]
  ) => RenderedNotification;
  return render(notification.data);
}
