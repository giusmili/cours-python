import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Roboto_Slab, Work_Sans } from "next/font/google";
import ServiceWorkerRegister from "../components/ServiceWorkerRegister";
import "./globals.css";

const workSans = Work_Sans({ subsets: ["latin"], variable: "--font-work-sans", display: "swap" });
const robotoSlab = Roboto_Slab({ subsets: ["latin"], variable: "--font-roboto-slab", display: "swap" });
const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0e1524",
};

const siteDescription = "Missions interactives de développement — Python, HTML, CSS et JavaScript.";

export const metadata: Metadata = {
  metadataBase: new URL("https://playground-dev.lagrandeclasse.fr"),
  title: "Terrain de jeu Dev",
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Playground — La Grande Classe",
    title: "Playground — La Grande Classe",
    description: siteDescription,
    url: "/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Logo LGC — Playground, missions interactives de développement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Playground — La Grande Classe",
    description: siteDescription,
    images: ["/og-image.png"],
  },
  manifest: "/favicon/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${workSans.variable} ${robotoSlab.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
