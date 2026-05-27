import type { Metadata } from "next";
import { Bricolage_Grotesque, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";

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

export const metadata: Metadata = {
  title: "Samuvel L — DevOps Engineer",
  description:
    "Portfolio of Samuvel L, DevOps Engineer at TCS. Building the pipelines that ship code — Kubernetes, Docker, Azure, CI/CD.",
  keywords: ["DevOps", "Cloud Engineer", "Kubernetes", "Docker", "Azure", "TCS", "Samuvel"],
  authors: [{ name: "Samuvel L" }],
  openGraph: {
    title: "Samuvel L — DevOps Engineer",
    description: "Building the pipelines that ship code.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${outfit.variable}`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
