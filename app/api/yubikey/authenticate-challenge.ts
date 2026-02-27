import { NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@/lib/webauthn";
import { prisma } from "@/lib/prisma";

// For demo, use a static user. In production, get from session/auth.
const DEMO_USER_ID = "demo-user-id";

export async function GET() {
  // Fetch credentials for user
  const credentials = await prisma.credential.findMany({ where: { userId: DEMO_USER_ID } });
  if (!credentials.length) {
    return NextResponse.json({ error: "No credentials registered." }, { status: 400 });
  }

  // Generate authentication options
  const options = await generateAuthenticationOptions({
    timeout: 60000,
    allowCredentials: credentials.map(cred => ({
      id: cred.credentialId, // should be a base64url string
      type: "public-key",
      transports: ["usb", "ble", "nfc"]
    })),
    userVerification: "preferred",
    rpID: process.env.WEBAUTHN_RPID || "localhost",
  });

  // Store challenge in DB
  await prisma.webAuthnChallenge.create({
    data: {
      userId: DEMO_USER_ID,
      challenge: options.challenge,
      type: "authentication",
    },
  });

  return NextResponse.json(options);
}
