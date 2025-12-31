"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Upload Data", href: "/upload" },
  { name: "Insights", href: "/insights" },
  { name: "Admin", href: "/admin", adminOnly: true },
];

export function DashboardNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="border-b border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">
                  A
                </span>
              </div>
              <span className="text-xl font-bold">Aegis Praetorian</span>
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => {
                if (item.adminOnly && !isAdmin) return null;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      pathname === item.href
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="flex items-center">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-10 w-10",
                },
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
