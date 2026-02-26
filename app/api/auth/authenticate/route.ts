import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const RP_ID = "blackboxdatadestruction.xyz";

export async function POST(req: Request) {
  const { email } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email },
    include: { credentials: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    allowCredentials: user.credentials.map((cred) => ({
      id: cred.credentialId,
    })),
    userVerification: "preferred",
  });

  return NextResponse.json(options);
}