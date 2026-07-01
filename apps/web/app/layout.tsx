import type { Metadata } from "next";
import { Geist, Geist_Mono, Gochi_Hand } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "../styles/globals.css";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Hand-drawn marker face for headings (Nook Riso notebook direction).
const gochiHand = Gochi_Hand({
  variable: "--font-hand",
  weight: "400",
  subsets: ["latin"],
});

// Canonical site URL: explicit env wins, else Vercel's production domain
// (auto-tracks the custom domain once assigned), else localhost in dev.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${APP_NAME} · Focus, made effortless`,
    template: `%s · ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  applicationName: APP_NAME,
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: `${APP_NAME} · Focus, made effortless`,
    description: APP_DESCRIPTION,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} · Focus, made effortless`,
    description: APP_DESCRIPTION,
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
      className={`${geistSans.variable} ${geistMono.variable} ${gochiHand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
