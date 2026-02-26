import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const RP_ID = "blackboxdatadestruction.xyz";
const ORIGIN = "https://www.blackboxdatadestruction.xyz";

export async function POST(req: Request) {
  const { email, authenticationResponse, expectedChallenge } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
    include: { credentials: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const credential = user.credentials.find(
    (c) => c.credentialId === authenticationResponse.id
  );

  if (!credential) {
    return NextResponse.json({ error: "Credential not found" }, { status: 404 });
  }

  const verification = await verifyAuthenticationResponse({
    response: authenticationResponse,
    expectedChallenge,
    expectedOrigin: ORIGIN,
    expectedRPID: RP_ID,
    credential: {
      id: credential.credentialId,
      publicKey: new Uint8Array(credential.publicKey),
      counter: Number(credential.counter),
    },
  });

  if (!verification.verified) {
    return NextResponse.json({ error: "Verification failed" }, { status: 400 });
  }

  await prisma.credential.update({
    where: { id: credential.id },
    data: { counter: verification.authenticationInfo.newCounter },
  });

  return NextResponse.json({ verified: true });
}