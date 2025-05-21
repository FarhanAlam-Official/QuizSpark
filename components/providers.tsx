"use client"

import { ThemeProvider } from "next-themes"
import { AppProvider } from "@/lib/context/AppContext"
import { SoundProvider } from "@/components/sound-effects"
import { Toaster } from "react-hot-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <SoundProvider>
        <AppProvider>
          {children}
          <Toaster position="bottom-right" />
        </AppProvider>
      </SoundProvider>
    </ThemeProvider>
  )
} 