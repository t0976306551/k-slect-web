import type { Metadata } from "next";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import TabBar from "@/components/TabBar";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://k-slect.com"),
  title: {
    template: "%s | 韓好物",
    default: "韓好物 | 韓國直送嚴選好物",
  },
  description: "從首爾到台灣，美妝、零食、服飾一站購足。嚴選正品韓貨，快速出貨。",
  openGraph: {
    siteName: "韓好物",
    locale: "zh_TW",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className={`${fraunces.variable} ${jakarta.variable} antialiased min-h-screen bg-[#F7F6F3]`}>
        <Navbar />
        <main className="pb-[88px] md:pb-0">{children}</main>
        <TabBar />
      </body>
    </html>
  );
}
