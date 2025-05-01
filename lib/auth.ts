import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // In a real application, you would fetch the user from your database
        // For now, we'll use a mock user for demonstration
        const mockUsers = [
          {
            id: "1",
            name: "John Doe",
            email: "john@example.com",
            password: "$2a$10$Hl0YE9qT6.HaI8xZZKZ7XeOgI.0ueUQe.Lz9JBvXQ5JJQ.ZZ5ZZZ", // "password"
          },
          {
            id: "2",
            name: "Admin User",
            email: "admin@jingally.com",
            password: "$2a$10$Hl0YE9qT6.HaI8xZZKZ7XeOgI.0ueUQe.Lz9JBvXQ5JJQ.ZZ5ZZZ", // "password"
          },
        ]

        const user = mockUsers.find((user) => user.email === credentials.email)

        if (!user) {
          return null
        }

        // In a real application, you would compare the password hash
        // For now, we'll accept "password" for any user
        const passwordMatch = credentials.password === "password"

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email
      }
      return session
    },
  },
}
