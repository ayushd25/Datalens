import type { Metadata } from "next";
import "./globals.css";
import GlobalLoader from "@/components/ui/GlobalLoader"; // <-- ADD THIS


export const metadata: Metadata = {
  title: "DataLens — AI Analytics Platform",
  description: "Transform raw data into actionable insights with AI-powered analytics",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface-950 text-surface-50 antialiased">
         <GlobalLoader />
        {children}
      </body>
    </html>
  );
}