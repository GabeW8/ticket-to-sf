import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ticket to SF/SG | Entry-Level Tech Jobs for New Grads",
  description:
    "Curated entry-level AI & Software Engineering jobs in San Francisco and Singapore. H-1B friendly. Updated daily from 50+ companies.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
