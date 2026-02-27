export async function POST(request: Request) {
  const { userId } = await request.json();
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }
  // Fetch user from DB
  let user = await prisma.user.findUnique({ where: { email: userId } });
  if (!user) {
    // Optionally create user or return error
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  // Generate registration options
  const options = await generateRegistrationOptions({
    rpName: "Black Box Technologies",
    rpID: process.env.WEBAUTHN_RPID || "localhost",
    userID: Buffer.from(user.id, 'utf-8'),
    userName: user.email || user.id,
    userDisplayName: user.name || user.email || user.id,
    attestationType: "direct",
    authenticatorSelection: { userVerification: "preferred" },
    timeout: 60000,
  });
  // Store challenge in DB
  await prisma.webAuthnChallenge.create({
    data: {
      userId: user.id,
      challenge: options.challenge,
      type: "registration",
    },
  });
  return NextResponse.json(options);
}
import { NextResponse } from "next/server";
import { generateRegistrationOptions } from "@/lib/webauthn";
import { prisma } from "@/lib/prisma";

// For demo, use a static user. In production, get from session/auth.
const DEMO_USER_ID = "demo-user-id";
const DEMO_USER_EMAIL = "demo@blackbox.com";
const DEMO_USER_NAME = "Demo User";

export async function GET() {
  // Fetch user from DB (replace with real user lookup in production)
  let user = await prisma.user.findUnique({ where: { id: DEMO_USER_ID } });
  if (!user) {
    user = await prisma.user.create({ data: { id: DEMO_USER_ID, email: DEMO_USER_EMAIL, name: DEMO_USER_NAME, password: "placeholder" } });
  }

  // Generate registration options
  const options = await generateRegistrationOptions({
    rpName: "Black Box Technologies",
    rpID: process.env.WEBAUTHN_RPID || "localhost",
    userID: Buffer.from(user.id, 'utf-8'),
    userName: user.email || user.id,
    userDisplayName: user.name || user.email || user.id,
    attestationType: "direct",
    authenticatorSelection: { userVerification: "preferred" },
    timeout: 60000,
  });

  // Store challenge in DB
  await prisma.webAuthnChallenge.create({
    data: {
      userId: user.id,
      challenge: options.challenge,
      type: "registration",
    },
  });

  return NextResponse.json(options);
}
