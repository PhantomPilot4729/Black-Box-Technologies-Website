import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const docs = await prisma.document.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(docs);
}

export async function POST(req: Request) {
  const { name, url, size, uploadedBy } = await req.json();
  const doc = await prisma.document.create({ data: { name, url, size, uploadedBy } });
  return NextResponse.json(doc);
}
