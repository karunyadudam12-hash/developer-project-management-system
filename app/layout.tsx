import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import NotificationBell from "@/src/components/notifications/NotificationBell";
import LogoutButton from "@/src/components/auth/LogoutButton";
import { getCurrentUser } from "@/src/services/current-user.service";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DPMS",
    template: "%s | DPMS",
  },
  description: "Developer Project Management System",
};

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/users", label: "Users" },
];

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;
  const hasSession = Boolean(token && await getCurrentUser(token));

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full text-gray-900">
        <header className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 shadow-sm backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex min-h-16 items-center justify-between gap-2 sm:gap-4">
              <Link
                href={hasSession ? "/dashboard" : "/"}
                className="shrink-0 text-xl font-bold tracking-tight text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
              >
                DPMS
              </Link>

              <nav aria-label="Main navigation" className="hidden items-center gap-1 md:flex">
                {(hasSession ? navigation : [
                  { href: "/login", label: "Sign in" },
                  { href: "/register", label: "Create account" },
                ]).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                {hasSession && (
                  <>
                    <NotificationBell />
                    <LogoutButton />
                  </>
                )}
              </div>
            </div>

            <nav aria-label="Mobile navigation" className="flex gap-1 overflow-x-auto border-t border-gray-100 py-2 md:hidden">
              {(hasSession ? navigation : [
                { href: "/login", label: "Sign in" },
                { href: "/register", label: "Create account" },
              ]).map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="shrink-0 rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {item.label}
                </Link>
              ))}

            </nav>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
