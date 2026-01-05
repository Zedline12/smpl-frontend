import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import MarketingNavBar from "@/components/MarketingNavBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SMPL - AI Photo & Video Generator",
  description:
    "Generate stunning photos and videos with AI and schedule them to your social media.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-white`}
      >
        <MarketingNavBar />
        <main className="flex-grow pt-16">{children}</main>
      </body>
    </html>
  );
}
