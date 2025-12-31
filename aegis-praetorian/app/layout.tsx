import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aegis Praetorian - Automotive Inventory Intelligence",
  description: "Production-ready automotive inventory intelligence platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#3b82f6",
        },
      }}
    >
      <html lang="en" className="dark">
        <body className="font-sans antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
