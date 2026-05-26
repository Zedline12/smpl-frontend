import type { Metadata } from "next";
import { Geist, DM_Mono, Archivo_Black } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { GlobalLoginModal } from "@/features/auth/components/GlobalLoginModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const archivoblack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "SMPL",
  description: "SMPL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${dmMono.variable} ${archivoblack.variable} antialiased bg-background`}
      >
        <Providers>
          {children}
          <GlobalLoginModal />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
