import { auth } from "@clerk/nextjs/server";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { sessionClaims } = await auth();
  const isAdmin = sessionClaims?.metadata?.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav isAdmin={isAdmin as boolean} />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
