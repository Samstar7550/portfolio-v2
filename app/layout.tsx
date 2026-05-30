import type { Metadata } from "next";
import { Bricolage_Grotesque, Outfit, Dancing_Script } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import PaletteProvider from "@/components/PaletteProvider";
import ServiceWorker from "@/components/ServiceWorker";

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
  metadataBase: new URL("https://www.samuvel.in"),
  title: "Samuvel L — DevOps Engineer",
  description:
    "Portfolio of Samuvel L, DevOps Engineer at TCS. Building the pipelines that ship code — Kubernetes, Docker, Azure, CI/CD.",
  keywords: ["DevOps", "Cloud Engineer", "Kubernetes", "Docker", "Azure", "TCS", "Samuvel"],
  authors: [{ name: "Samuvel L" }],
  // Icons come from file conventions: app/icon.svg and app/apple-icon.png.
  // Next.js emits <link rel="icon" href="/icon.svg?<hash>"> with a content hash,
  // so the browser cache busts whenever the icon changes. Do NOT set an `icons`
  // field here — defining it suppresses the auto-generated hashed icon links.
  manifest: "/site.webmanifest",
  appleWebApp: { capable: true, title: "Samuvel L", statusBarStyle: "black-translucent" },
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
        {/* Structured data — helps Google render a rich Person result */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Samuvel L",
              jobTitle: "DevOps Engineer",
              url: "https://www.samuvel.in",
              email: "mailto:contact@samuvel.in",
              worksFor: { "@type": "Organization", name: "Tata Consultancy Services" },
              knowsAbout: ["DevOps", "Kubernetes", "Docker", "Microsoft Azure", "CI/CD", "UI/UX Design"],
              sameAs: [
                "https://linkedin.com/in/samuvel7550",
                "https://github.com/Samstar7550",
              ],
            }),
          }}
        />
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <PaletteProvider />
        <ServiceWorker />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
