import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-primary">
            Aegis Praetorian
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Automotive Inventory Intelligence Platform
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-card shadow-xl",
            },
          }}
        />
      </div>
    </div>
  );
}
