import type { Metadata, Viewport } from "next";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "CET Prep — Ace Your College Entrance Exam",
    template: "%s | CET Prep",
  },
  description:
    "The only CET prep platform powered by cognitive science. Stop cramming. Start remembering. Spaced repetition, mock exams, and personalized study plans for Filipino students.",
  keywords: [
    "CET",
    "ACET",
    "DCAT",
    "USTET",
    "ACET",
    "DCAT",
    "college entrance exam",
    "Philippines",
    "review",
    "spaced repetition",
    "flashcards",
  ],
  authors: [{ name: "CET Prep" }],
  metadataBase: new URL("https://cetprep.vercel.app"),
  openGraph: {
    type: "website",
    siteName: "CET Prep",
    title: "CET Prep — Ace Your College Entrance Exam",
    description:
      "Science-backed CET preparation. Spaced repetition, dynamic mock exams, and personalized study plans.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
