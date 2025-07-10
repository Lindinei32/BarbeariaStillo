// app/_lib/auth.ts

import { PrismaAdapter } from "@auth/prisma-adapter"
import { AuthOptions } from "next-auth"
import { Adapter } from "next-auth/adapters"
import GoogleProvider from "next-auth/providers/google"
import { db } from "./prisma"

// ===================================================================
// PASSO 1: CORRIGIR A DECLARAÇÃO DE TIPOS PARA USAR 'isAdmin'
// ===================================================================
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string
      isAdmin: boolean; // <-- Usando 'isAdmin' que existe no seu DB
    }
  }

  // Não precisamos mais estender a interface User aqui, pois o Prisma já a define.
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // ===================================================================
    // PASSO 2: CORRIGIR A LÓGICA DA SESSÃO PARA LER 'isAdmin'
    // ===================================================================
    async session({ session, user }) {
      if (session.user) {
        // Buscamos o usuário no nosso banco para pegar a propriedade 'isAdmin'
        const userFromDb = await db.user.findUnique({
          where: { id: user.id },
        });

        // Adicionamos o status 'isAdmin' do banco à sessão
        session.user.isAdmin = userFromDb?.isAdmin ?? false; // Se não achar, não é admin
        session.user.id = user.id;
      }
      return session;
    },
  },

  secret: process.env.NEXT_AUTH_SECRET!,

  pages: {
    signOut: "/",
  },
}