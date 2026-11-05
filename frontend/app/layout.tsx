import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/globals.css";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { getUnreadNotificationCount } from "@/lib/actions";
import { queryKeys } from "@/lib/queryKeys";
import { Footer } from "@/components/common/Footer";
import { Navbar } from "@/components/navbar/Navbar";
import { Toaster } from "@/components/ui/sonner";
import FiltersProvider from "@/providers/FiltersProvider";
import TanstackQueryProvider from "@/providers/TanstackQueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Penn Marketplace", template: "%s | Penn Marketplace" },
  description: "Buy and sell items and find sublets with other Penn students.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // prefetchQuery (not fetchQuery) swallows errors, so an unauthed request just hydrates nothing.
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.notificationsUnreadCount(),
    queryFn: getUnreadNotificationCount,
  });

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background flex min-h-screen flex-col antialiased`}
      >
        <TanstackQueryProvider>
          <FiltersProvider>
            <HydrationBoundary state={dehydrate(queryClient)}>
              <Navbar />
            </HydrationBoundary>
            <div className="container mx-auto w-full max-w-[96rem] grow space-y-6 px-4 pt-22 pb-12 sm:px-12">
              {children}
            </div>
            <Footer />
          </FiltersProvider>
          <ReactQueryDevtools />
          <Toaster />
        </TanstackQueryProvider>
      </body>
    </html>
  );
}
