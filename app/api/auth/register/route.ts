import { generateRegistrationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const RP_NAME = "Black Box Technologies";
const RP_ID = "blackboxdatadestruction.xyz";

export async function POST(req: Request) {
  const { email } = await req.json();

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    // WebAuthn-only users get a random password (not used for login)
    user = await prisma.user.create({ data: { email, password: Math.random().toString(36).slice(2) } });
  }

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: new TextEncoder().encode(user.id),
    userName: email,
    attestationType: "none",
    authenticatorSelection: {
      authenticatorAttachment: "cross-platform",
      userVerification: "preferred",
    },
  });

  return NextResponse.json(options);
}