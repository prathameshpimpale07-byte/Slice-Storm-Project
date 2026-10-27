import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

export const metadata = {
  title: "Slice Storm — Fruit Slicing Game",
  description:
    "Slice fruits, dodge bombs, earn combos. A browser-based fruit-slicing game with global leaderboards.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#0a0e1a] text-white antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
