import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Define tier arrays for permissions
const EXECUTIVE_TIERS = ["EXECUTIVE"];
const MANAGEMENT_TIERS = ["EXECUTIVE", "MANAGEMENT"];
const EMPLOYEE_TIERS = ["EXECUTIVE", "MANAGEMENT", "EMPLOYEE"];

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
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, email: true, role: true, password: true },
        });
        if (!user || !user.password) return null;
        // Check password using bcryptjs
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) return null;
        // Return user with role
        return { id: user.id, email: user.email, role: user.role };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }) {
      if (typeof token?.role === "string" && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user && typeof user === "object" && "role" in user && typeof user.role === "string") {
        token.role = user.role;
      }
      return token;
    },
  },
});

export { handler as GET, handler as POST };