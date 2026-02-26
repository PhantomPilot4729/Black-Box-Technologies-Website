import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const [
    totalOrders,
    totalCustomers,
    pendingOrders,
    completedOrders,
    inProgressOrders,
    cancelledOrders,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.customer.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: "IN_PROGRESS" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
  ]);

  const revenue = await prisma.order.aggregate({
    _sum: { price: true },
    where: { status: "COMPLETED" },
  });

  return NextResponse.json({
    totalOrders,
    totalCustomers,
    pendingOrders,
    completedOrders,
    inProgressOrders,
    cancelledOrders,
    totalRevenue: revenue._sum.price ?? 0,
    recentOrders,
  });
}
