import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const RP_ID = "blackboxdatadestruction.xyz";
const ORIGIN = "https://www.blackboxdatadestruction.xyz";

export async function POST(req: Request) {
  const { email, registrationResponse, expectedChallenge } = await req.json();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const verification = await verifyRegistrationResponse({
    response: registrationResponse,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
  });

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  const { credential } = verification.registrationInfo;

  await prisma.credential.create({
    data: {
      userId: user.id,
      credentialId: credential.id,
      publicKey: Buffer.from(credential.publicKey),
      counter: credential.counter,
    },
  });

  return NextResponse.json({ verified: true });
}