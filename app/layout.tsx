import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { Suspense } from 'react'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Jingally Logistics",
  description: "Your trusted partner for global shipping and logistics solutions",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <Suspense fallback={
              <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-background to-muted">
                <div className="flex flex-col items-center space-y-8">
                  <div className="relative">
                    <div className="h-20 w-20 animate-spin rounded-full border-4 border-orange-500 border-t-transparent shadow-lg" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-10 w-10 animate-pulse rounded-full bg-orange-500/30 shadow-inner" />
                    </div>
                    <div className="absolute -inset-2 rounded-full border-2 border-orange-500/20 animate-ping" />
                  </div>
                  <div className="flex flex-col items-center space-y-3">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                      Jingally Logistics
                    </h1>
                    <div className="flex items-center space-x-2">
                      <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.3s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500 [animation-delay:-0.15s]" />
                      <div className="h-2 w-2 animate-bounce rounded-full bg-orange-500" />
                    </div>
                    <p className="text-sm text-muted-foreground animate-pulse">
                      Crafting your seamless logistics experience...
                    </p>
                  </div>
                </div>
              </div>
            }>
              {children}
            </Suspense>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      {/* <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full"
          onClick={() => {
            const currentTheme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
            document.documentElement.classList.toggle('dark');
            localStorage.setItem('theme', currentTheme);
          }}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div> */}
      </body>
    </html>
  )
}
