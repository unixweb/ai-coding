import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ConditionalNav } from "@/components/conditional-nav";
import "./globals.css";

export const metadata: Metadata = {
  title: "TaskManager - Projekt- und Task-Verwaltung",
  description: "Einfaches Projekt- und Task-Management für kleine Teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="antialiased">
        <ConditionalNav />
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
