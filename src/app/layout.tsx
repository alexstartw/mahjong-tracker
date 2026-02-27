import type { Metadata } from "next";
import { Playfair_Display, Noto_Serif_TC } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

const noto = Noto_Serif_TC({
  variable: "--font-noto",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
      <body className={`${playfair.variable} ${noto.variable}`}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
