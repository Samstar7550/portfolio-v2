import type { Metadata } from "next";
import { Bricolage_Grotesque, Outfit, Dancing_Script } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import PaletteProvider from "@/components/PaletteProvider";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const dancing = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-signature",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Samuvel L — DevOps Engineer",
  description:
    "Portfolio of Samuvel L, DevOps Engineer at TCS. Building the pipelines that ship code — Kubernetes, Docker, Azure, CI/CD.",
  keywords: ["DevOps", "Cloud Engineer", "Kubernetes", "Docker", "Azure", "TCS", "Samuvel"],
  authors: [{ name: "Samuvel L" }],
  // The primary icon is app/icon.svg — Next.js serves it with a content hash
  // (/icon.svg?<hash>) so the browser cache busts whenever the file changes.
  // public/favicon.ico answers the implicit /favicon.ico request for legacy
  // browsers and crawlers. Don't define `icon` here or it overrides the hashed
  // file-convention icon and the favicon stops updating.
  icons: {
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Samuvel L — DevOps Engineer",
    description: "Building the pipelines that ship code.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Samuvel L — DevOps Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Samuvel L — DevOps Engineer",
    description: "Building the pipelines that ship code.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${outfit.variable} ${dancing.variable}`}>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <PaletteProvider />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
