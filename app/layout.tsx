import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "./_components/ui/footer";
import { Toaster } from "./_components/ui/sonner";
import AuthProvider from "./_providers/auth";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

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
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`text-gray-300 ${geistSans.variable} flex min-h-screen flex-col antialiased`}
        style={{
          backgroundColor: "#1A1A1A", // Cor de fundo preta/cinza escura (mesma da classe bg-[#1A1A1A])
        }}
      >
        <AuthProvider>
          <div className="flex-grow">{children}</div>
          <Toaster />
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}