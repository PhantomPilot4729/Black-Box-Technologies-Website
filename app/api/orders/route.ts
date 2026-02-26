import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { customer: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const { customerId, service, description, price, status } = await req.json();
  const order = await prisma.order.create({
    data: { customerId, service, description, price, status },
    include: { customer: true },
  });
  return NextResponse.json(order);
}
