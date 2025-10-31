import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "./globals.css";
import Nav from "./components/Nav"; // ✅ import your navbar

const sora = Sora({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VSU CHNS News",
  description: "News site for VSU College of Humanities and Natural Sciences",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={sora.className}>
        <Nav /> {/* ✅ Navbar appears on all pages */}
        {children}
      </body>
    </html>
  );
}
