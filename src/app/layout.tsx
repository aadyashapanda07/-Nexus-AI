import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nexus AI - Predictive Task Management Ecosystem",
  description:
    "Intelligent task management using predictive AI to optimize team velocity and automate workflow assignments.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080414] text-slate-100 antialiased selection:bg-purple-600/30 selection:text-purple-200">
        {children}
      </body>
    </html>
  );
}
