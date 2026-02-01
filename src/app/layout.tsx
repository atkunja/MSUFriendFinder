import type { Metadata } from "next";
import { Playfair_Display, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Premium serif for headings - elegant, distinctive
const playfair = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

// Modern geometric sans for body - clean, readable
const spaceGrotesk = Space_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

// Technical mono for stats and badges
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SpartanFinder | The Premium MSU Connection Network",
  description: "The exclusive friend-finder network for Michigan State University students. Forge meaningful connections with fellow Spartans.",
  keywords: ["MSU", "Michigan State", "friends", "networking", "college", "students"],
  openGraph: {
    title: "SpartanFinder | The Premium MSU Connection Network",
    description: "Find your study collective, lifestyle partners, and meaningful friendships within the MSU community.",
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
      <body
        className={`${playfair.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
