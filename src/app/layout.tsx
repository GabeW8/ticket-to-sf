import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SF Tech Jobs | H-1B Friendly",
  description:
    "AI & Software Engineering job listings in San Francisco from H-1B sponsoring companies. Updated daily.",
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
