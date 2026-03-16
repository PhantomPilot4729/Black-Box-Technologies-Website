import type { SessionStrategy } from "next-auth";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Define tier arrays for permissions
const EXECUTIVE_TIERS = ["EXECUTIVE"];
const MANAGEMENT_TIERS = ["EXECUTIVE", "MANAGEMENT"];
const EMPLOYEE_TIERS = ["EXECUTIVE", "MANAGEMENT", "EMPLOYEE"];

export const authOptions = {
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
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 1 day
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, token }: any) {
      if (typeof token?.role === "string" && session.user) {
        session.user.role = token.role;
      }
      // Optionally set custom session expiry if rememberMe is passed
      // (NextAuth handles session expiration internally)
      return session;
    },
    async jwt(params: any) {
      const { token, user, account } = params;
      if (user && typeof user === "object" && "role" in user && typeof user.role === "string") {
        token.role = user.role;
      }
      // Pass rememberMe from signIn to token
      if (account && account.provider === "credentials" && typeof account.rememberMe !== "undefined") {
        token.rememberMe = account.rememberMe;
      }
      return token;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };