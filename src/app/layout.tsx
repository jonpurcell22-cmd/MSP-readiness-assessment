import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MSP Channel Readiness Assessment | Untapped Channel Strategy",
  description:
    "Evaluate your readiness to build a profitable MSP channel program. Get a personalized scorecard, competitive analysis, and financial projections.",
  icons: {
    icon: "/images/Untapped%20Channel%20Logo%20Symbol%20Transparent%20bg.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#4cf37b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased min-h-screen bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
