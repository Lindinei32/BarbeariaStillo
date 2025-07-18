// app/layout.tsx

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// MANTEMOS OS SEUS COMPONENTES
import Footer from "./_components/ui/footer";
import { Toaster } from "./_components/ui/sonner";

// ===================================================================
// A ÚNICA MUDANÇA REAL ESTÁ AQUI
// ===================================================================
// Trocamos o import do AuthProvider antigo pelo nosso novo AuthProvider do Contexto.
// DE: import AuthProvider from "./_providers/auth";
// PARA:
import { AuthProvider } from "./_context/AuthContext";

// MANTEMOS A SUA FONTE CUSTOMIZADA
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

// MANTEMOS SEU METADATA
export const metadata: Metadata = {
  title: "Barbearia Stillo",
  description: "Seu estilo em Curitiba",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // MANTEMOS TODAS AS SUAS CONFIGURAÇÕES DE ESTILO
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`text-gray-300 ${geistSans.variable} flex min-h-screen flex-col antialiased`}
        style={{
          backgroundColor: "#1A1A1A", // Sua cor de fundo escura
        }}
      >
        {/* Usamos o AuthProvider NOVO, mas mantemos a ESTRUTURA que você já tinha */}
        <AuthProvider>
          <div className="flex-grow">{children}</div>
          <Toaster />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}