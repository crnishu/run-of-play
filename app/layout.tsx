import type { Metadata } from "next";
import { Anton, Hanken_Grotesk } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-hanken",
});

export const metadata: Metadata = {
  title: "Run of Play",
  description: "One career. No restarts.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${hanken.variable}`}>
      <body>{children}</body>
    </html>
  );
}
