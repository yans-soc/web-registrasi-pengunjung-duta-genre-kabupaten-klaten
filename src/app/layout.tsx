import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "E-Ticketing Duta Genre Klaten 2026",
  description: "Portal registrasi tiket pengunjung resmi Apresiasi & Pemilihan Duta Genre Kabupaten Klaten 2026.",
  keywords: "Duta Genre, Klaten, tiket, e-ticketing, pengunjung, registrasi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
