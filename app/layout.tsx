import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "UPCAT Prep — Ace Your College Entrance Exam",
    template: "%s | UPCAT Prep",
  },
  description:
    "The only UPCAT prep platform powered by cognitive science. Stop cramming. Start remembering. Spaced repetition, mock exams, and personalized study plans for Filipino students.",
  keywords: [
    "UPCAT",
    "ACET",
    "DCAT",
    "college entrance exam",
    "Philippines",
    "review",
    "spaced repetition",
    "flashcards",
  ],
  authors: [{ name: "UPCAT Prep" }],
  metadataBase: new URL("https://upcatprep.vercel.app"),
  openGraph: {
    type: "website",
    siteName: "UPCAT Prep",
    title: "UPCAT Prep — Ace Your College Entrance Exam",
    description:
      "Science-backed UPCAT preparation. Spaced repetition, dynamic mock exams, and personalized study plans.",
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
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {children}
      </body>
    </html>
  );
}
