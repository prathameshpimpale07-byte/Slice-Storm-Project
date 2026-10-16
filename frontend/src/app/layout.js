import { Exo_2, Inter } from "next/font/google";
import "./globals.css";

const exo2 = Exo_2({
  variable: "--font-exo2",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata = {
  title: "Slice Storm — Fruit Slicing Game",
  description:
    "Slice fruits, dodge bombs, earn combos. A browser-based fruit-slicing game with global leaderboards.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${exo2.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col bg-[#0a0e1a] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
