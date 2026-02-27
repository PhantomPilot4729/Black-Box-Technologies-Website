import { NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@/lib/webauthn";
import { prisma } from "@/lib/prisma";

// For demo, use a static user. In production, get from session/auth.
const DEMO_USER_ID = "demo-user-id";

export async function POST(request: Request) {
  const body = await request.json();
  const { attestationResponse } = body;

  // Get latest registration challenge for user
  const challengeRecord = await prisma.webAuthnChallenge.findFirst({
    where: { userId: DEMO_USER_ID, type: "registration" },
    orderBy: { createdAt: "desc" },
  });
  if (!challengeRecord) {
    return NextResponse.json({ success: false, error: "No registration challenge found." }, { status: 400 });
  }

  // Verify attestation
  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: attestationResponse,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: process.env.WEBAUTHN_ORIGIN || "http://localhost:3000",
      expectedRPID: process.env.WEBAUTHN_RPID || "localhost",
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Attestation verification failed." }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ success: false, error: "Attestation not verified." }, { status: 400 });
  }

  const { credential, credentialType, attestationObject, credentialID, credentialPublicKey, counter } = verification.registrationInfo as any;
  // If your library uses different property names, adjust accordingly:
  // e.g., const { credential, credentialPublicKey, counter } = verification.registrationInfo as any;

  // Store credential in DB
  await prisma.credential.create({
    data: {
      userId: DEMO_USER_ID,
      credentialId: Buffer.from(credentialID).toString("base64"),
      publicKey: Buffer.from(credentialPublicKey),
      counter: BigInt(counter),
    },
  });

  // Optionally, delete the challenge
  await prisma.webAuthnChallenge.delete({ where: { id: challengeRecord.id } });

  return NextResponse.json({ success: true });
}
