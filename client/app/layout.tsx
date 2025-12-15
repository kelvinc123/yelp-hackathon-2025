import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YesorNext",
  description: "YesorNext is a conversational foodie friend that never shows a giant list. You tell it what you're in the mood for, it shows one high-confidence restaurant at a time and asks: 'Yes or next?' Powered by Yelp's AI API, it learns from your swipes, wishlist, and (optionally) your friends' tastes, then helps you book when you hit 'Yes'.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${manrope.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
