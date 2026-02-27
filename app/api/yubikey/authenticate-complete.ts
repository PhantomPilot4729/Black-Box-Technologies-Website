import { NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@/lib/webauthn";
import { prisma } from "@/lib/prisma";

// For demo, use a static user. In production, get from session/auth.
const DEMO_USER_ID = "demo-user-id";

export async function POST(request: Request) {
  const body = await request.json();
  const { assertionResponse } = body;

  // Get latest authentication challenge for user
  const challengeRecord = await prisma.webAuthnChallenge.findFirst({
    where: { userId: DEMO_USER_ID, type: "authentication" },
    orderBy: { createdAt: "desc" },
  });
  if (!challengeRecord) {
    return NextResponse.json({ success: false, error: "No authentication challenge found." }, { status: 400 });
  }

  // Get credential from DB
  const credId = Buffer.from(assertionResponse.rawId).toString("base64");
  const credential = await prisma.credential.findUnique({ where: { credentialId: credId } });
  if (!credential) {
    return NextResponse.json({ success: false, error: "Credential not found." }, { status: 400 });
  }

  // Verify assertion
  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: assertionResponse,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: process.env.WEBAUTHN_ORIGIN || "http://localhost:3000",
      expectedRPID: process.env.WEBAUTHN_RPID || "localhost",
      credential: {
        id: credential.credentialId,
        publicKey: Buffer.from(credential.publicKey),
        counter: Number(credential.counter),
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: "Assertion verification failed." }, { status: 400 });
  }

  if (!verification.verified) {
    return NextResponse.json({ success: false, error: "Assertion not verified." }, { status: 400 });
  }

  // Update credential counter
  await prisma.credential.update({
    where: { credentialId: credId },
    data: { counter: BigInt(verification.authenticationInfo.newCounter) },
  });

  // Optionally, delete the challenge
  await prisma.webAuthnChallenge.delete({ where: { id: challengeRecord.id } });

  return NextResponse.json({ success: true });
}
