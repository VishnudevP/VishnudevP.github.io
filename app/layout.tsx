import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata: Metadata = {
  title: "Vishnudev Poil // Full-Stack Engineer",
  description:
    "Portfolio of Vishnudev Poil — Full-Stack Engineer building products, systems, and experiences at scale.",
  openGraph: {
    title: "Vishnudev Poil // Full-Stack Engineer",
    description: "Portfolio of Vishnudev Poil",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
