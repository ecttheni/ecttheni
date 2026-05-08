import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "ECT - Theni Center | Engineers Club Tamilnadu",
  description: "Official portal for Civil Engineers in Theni District, Tamil Nadu. Networking, Portfolios, and Professional Growth.",
  keywords: ["Civil Engineers", "Theni", "Engineers Club", "Tamilnadu", "ECT", "Engineering Directory"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased bg-mesh min-h-screen`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
