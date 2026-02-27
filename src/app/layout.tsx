import type { Metadata } from "next";
import { Oxanium, Merriweather } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const oxanium = Oxanium({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const merriweather = Merriweather({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "麻將記錄",
  description: "麻將輸贏計算與記錄",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body className={`${oxanium.variable} ${merriweather.variable}`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
