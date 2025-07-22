// app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// ===================================================================
// CORREÇÃO APLICADA AQUI: usamos o atalho '@/' que aponta para a pasta 'app'
// ===================================================================
import { AuthProvider } from '@/app/_context/AuthContext'
import { Toaster } from '@/app/_components/ui/sonner'
import Footer from '@/app/_components/ui/footer'

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
    // Recomendo remover a classe 'dark' daqui se você já a tem no <body>
    <html lang="pt-br" className="dark">
      <body className={`${inter.className} dark bg-background`}>
        <AuthProvider>
          <div className="flex flex-grow flex-col">{children}</div>
          <Toaster />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
