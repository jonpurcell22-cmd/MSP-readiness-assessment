import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MSP Channel Readiness Assessment | Untapped Channel Strategy",
  description:
    "Find out in 10 minutes. Get a personalized readiness score and financial impact analysis for your MSP partner program.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-[#F4F7FA] text-[#1B3A5C] font-sans">
        {children}
      </body>
    </html>
  );
}
