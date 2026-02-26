import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { orders: true } } },
  });
  return NextResponse.json(customers);
}

export async function POST(req: Request) {
  const { name, email, phone, company, notes } = await req.json();
  const customer = await prisma.customer.create({
    data: { name, email, phone, company, notes },
  });
  return NextResponse.json(customer);
}
