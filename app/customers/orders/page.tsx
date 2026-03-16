"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RecentOrders() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/customers/login");
    else if (session?.user?.role !== "CUSTOMER") router.push("/");
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated" || session?.user?.role !== "CUSTOMER") {
    return null;
  }

  // Placeholder for orders
  const orders = [
    { id: 1, item: "Black Wall Device", date: "2026-03-01", cost: "$299.99", tracking: "BBT123456" },
    { id: 2, item: "Kernel Key", date: "2026-02-15", cost: "$49.99", tracking: "BBT654321" }
  ];

  return (
    <main>
      <section className="page-hero">
        <h1>RECENT ORDERS</h1>
        <p>View your recent orders</p>
      </section>
      <section className="dashboard-section">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Date Ordered</th>
              <th>Cost</th>
              <th>Tracking Number</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.item}</td>
                <td>{order.date}</td>
                <td>{order.cost}</td>
                <td>{order.tracking}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
