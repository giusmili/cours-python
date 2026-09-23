import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Terrain de jeu Dev",
  description: "Missions interactives de développement — Python, HTML, CSS et JavaScript.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
