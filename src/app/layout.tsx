import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1e293b"
}

export const metadata: Metadata = {
  title: "Atmosphere - Global Air Quality Map",
  description: "Explore real-time air quality data, pollution levels, and environmental insights from around the world with our interactive map.",
  keywords: ["air quality", "pollution", "AQI", "environmental data", "air quality index", "global air quality", "pollution map"],
  authors: [{ name: "Atmosphere" }],
  creator: "Atmosphere",
  publisher: "Atmosphere",
  metadataBase: new URL("https://atmosphere-map.vercel.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://atmosphere-map.vercel.app",
    title: "Atmosphere - Global Air Quality Map",
    description: "Explore real-time air quality data, pollution levels, and environmental insights from around the world.",
    siteName: "Atmosphere",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Atmosphere - Global Air Quality Map"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Atmosphere - Global Air Quality Map",
    description: "Explore real-time air quality data, pollution levels, and environmental insights from around the world.",
    images: ["/og-image.png"]
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#1e293b"
      }
    ]
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Atmosphere"
  },
  formatDetection: {
    telephone: false
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}

