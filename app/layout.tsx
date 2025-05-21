import "./globals.css"
import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AppLayout } from "@/components/layout"
import { SoundProvider } from "@/components/sound-effects"
import { Toaster } from "react-hot-toast"
import { AppProvider } from "@/lib/context/AppContext"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Quiz App",
  description: "A modern quiz application for students",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <ThemeProvider>
          <SoundProvider>
            <AppProvider>
              <AppLayout>{children}</AppLayout>
              <Toaster position="top-right" />
            </AppProvider>
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
