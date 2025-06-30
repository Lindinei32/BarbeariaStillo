import { PrismaAdapter } from "@auth/prisma-adapter"
import {
  AuthOptions,
  DefaultSession,
  Session as NextAuthSession,
  User as NextAuthUser,
} from "next-auth"
import { Adapter } from "next-auth/adapters"
import GoogleProvider from "next-auth/providers/google"
import { db } from "./prisma" // Ensure this path is correct

// Type Augmentation for NextAuth Session and User
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      name: string
      email: string
      image: string
      isAdmin?: boolean
    } & DefaultSession["user"]
  }

  interface User {
    id: string // Ensure User type also has id
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  callbacks: {
    // Modifies the session object before it's returned to the client
    async session({
      session,
      user,
    }: {
      session: NextAuthSession
      user: NextAuthUser
    }) {
      if (session.user) {
        session.user.id = user.id
        session.user.name = user.name ?? ""
        session.user.email = user.email ?? ""
        session.user.image = user.image ?? ""
        if (
          user.name === "Barbearia Stillo" &&
          user.email === "stillobarbearia99@gmail.com"
        ) {
          session.user.isAdmin = true
        } else {
          session.user.isAdmin = false
        }
      }
      return session
    },
  },

  secret: process.env.NEXT_AUTH_SECRET!,

  // Custom pages configuration
  pages: {
    signOut: "/",
  },
}
