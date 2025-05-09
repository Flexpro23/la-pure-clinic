import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { LanguageProvider } from "@/contexts/language-context"
import { FirebaseProvider } from "@/contexts/firebase-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "LaPure Medical Clinic",
  description: "Professional hair transplant simulation and planning tool for clinics",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FirebaseProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </FirebaseProvider>
      </body>
    </html>
  )
}
