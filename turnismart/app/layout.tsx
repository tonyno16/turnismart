import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TurniSmart - Scheduling del personale con AI",
  description:
    "Piattaforma SaaS per gestione orari multi-sede. Genera orari con AI, notifiche WhatsApp, report per commercialista. Prova gratuita.",
  keywords: ["turni", "orari", "scheduling", "AI", "personale", "ristorante", "retail"],
  authors: [{ name: "TurniSmart" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "TurniSmart - Scheduling del personale con AI",
    description:
      "Piattaforma SaaS per gestione orari multi-sede. Genera orari con AI, notifiche WhatsApp, report per commercialista.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
