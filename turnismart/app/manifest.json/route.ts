import { NextResponse } from "next/server";

const manifest = {
  name: "TurniSmart",
  short_name: "TurniSmart",
  description: "Scheduling del personale con AI - Gestione orari multi-sede",
  start_url: "/",
  display: "standalone",
  background_color: "#ffffff",
  theme_color: "#0f172a",
  lang: "it",
  icons: [
    {
      src: "/favicon.ico",
      sizes: "48x48",
      type: "image/x-icon",
      purpose: "any",
    },
  ],
};

export function GET() {
  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
