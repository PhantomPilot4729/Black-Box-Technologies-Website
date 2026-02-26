import { generateRegistrationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const RP_NAME = "Black Box Technologies";
const RP_ID = "blackboxdatadestruction.xyz";

export async function POST(req: Request) {
  const { email } = await req.json();

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email } });
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