import { SignOutButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function PendingApprovalPage() {
  const { userId } = await auth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto h-24 w-24 rounded-full bg-yellow-500/10 flex items-center justify-center">
            <svg
              className="h-12 w-12 text-yellow-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Approval Pending</h1>
          <p className="text-muted-foreground">
            Your account has been created successfully. However, access to the
            Aegis Praetorian platform requires administrator approval.
          </p>
          <p className="text-sm text-muted-foreground">
            An administrator will review your request shortly. You will receive
            an email notification once your account has been approved.
          </p>
        </div>
        <div className="pt-4">
          <SignOutButton>
            <button className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
