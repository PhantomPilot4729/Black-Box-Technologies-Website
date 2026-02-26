import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        // Find user in database
        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        // For now, compare password to env var (later: store hashed passwords)
        const validPassword = process.env.ADMIN_PASSWORD;
        if (credentials.password === validPassword) {
          return { id: user.id, email: user.email, role: user.role };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (token?.role) session.user.role = token.role;
      return session;
    },
    async jwt({ token, user }) {
      if (user?.role) token.role = user.role;
      return token;
    },
  },
});

export { handler as GET, handler as POST };