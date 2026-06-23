import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Task Mining Adoption",
  description: "Adoption dashboard for Celonis Task Mining (Datadog snapshot)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
