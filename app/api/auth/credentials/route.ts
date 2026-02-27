import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  if (!email) {
    return NextResponse.json({ credentials: [] });
  }
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, credentials: { select: { credentialId: true } } },
  });
  if (!user) {
    return NextResponse.json({ credentials: [] });
  }
  return NextResponse.json({ credentials: user.credentials });
}
