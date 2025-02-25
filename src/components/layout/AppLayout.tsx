"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      icon: <Icons.home className="h-4 w-4" />,
      label: "Dashboard",
    },
    {
      href: "/health-data",
      icon: <Icons.heart className="h-4 w-4" />,
      label: "Health Data",
    },
    {
      href: "/conversations",
      icon: <Icons.messageSquare className="h-4 w-4" />,
      label: "Conversations",
    },
    {
      href: "/health-agents",
      icon: <Icons.sparkles className="h-4 w-4" />,
      label: "Health Agents",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center border-b bg-white dark:bg-zinc-900 px-6">
        <div className="flex flex-1 items-center gap-2">
          <Icons.activity className="h-6 w-6 text-blue-600" />
          <span className="text-lg font-semibold">OpenHealth</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
            <Icons.bell className="h-5 w-5" />
          </Button>
          <Avatar>
            <AvatarImage src="/avatars/user.jpg" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden w-[220px] flex-col border-r bg-white dark:bg-zinc-900 lg:flex">
          <nav className="grid gap-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
                  pathname === item.href 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-6xl space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 