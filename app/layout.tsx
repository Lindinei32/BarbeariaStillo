// app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google' // Supondo que você use a fonte Inter
import './globals.css'

import { AuthProvider } from './_context/AuthContext'
import { Toaster } from './_components/ui/sonner'
import Footer from './_components/ui/footer' // Garanta que o footer seja importado

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Barbearia Stillo',
  description: 'A sua barbearia de confiança',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-br" className="dark">
      {/* =================================================================== */}
      {/* A CORREÇÃO ESTÁ AQUI: Restauramos as classes e o estilo do body   */}
      {/* =================================================================== */}
      <body
        className={`${inter.className} dark flex min-h-screen flex-col bg-[#1A1A1A] text-gray-300`}
        suppressHydrationWarning>
        <AuthProvider>
          <div className="flex-grow">{children}</div>
          <Toaster />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
