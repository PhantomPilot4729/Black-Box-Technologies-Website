import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Analytics = {
  totalOrders: number;
  totalCustomers: number;
  pendingOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  recentOrders: { id: string; service: string; status: string; createdAt: string; customer: { name: string } }[];
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "var(--neon-yellow)",
  IN_PROGRESS: "var(--neon-cyan)",
  COMPLETED: "#00ff88",
  CANCELLED: "var(--neon-red)",
};

export default function AnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [salesTrend, setSalesTrend] = useState<{ labels: string[]; values: number[] }>({ labels: [], values: [] });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/analytics").then((r) => r.json()).then((d) => {
        setData(d);
        setLoading(false);
        // Build sales trend from recentOrders
        if (d.recentOrders && d.recentOrders.length > 0) {
          // Group by date
          const dateMap: Record<string, number> = {};
          d.recentOrders.forEach((o: any) => {
            const date = new Date(o.createdAt).toLocaleDateString();
            if (!dateMap[date]) dateMap[date] = 0;
            if (o.status === "COMPLETED" && o.price) dateMap[date] += o.price;
          });
          const labels = Object.keys(dateMap);
          const values = labels.map((l) => dateMap[l]);
          setSalesTrend({ labels, values });
        }
      });
    }
  }, [status]);

  if (loading || !data) return <main><section className="page-hero"><h1>LOADING...</h1></section></main>;

  const stats = [
    { label: "TOTAL ORDERS", value: data.totalOrders, color: "var(--neon-cyan)" },
    { label: "CUSTOMERS", value: data.totalCustomers, color: "var(--neon-cyan)" },
    { label: "PENDING", value: data.pendingOrders, color: "var(--neon-yellow)" },
    { label: "IN PROGRESS", value: data.inProgressOrders, color: "var(--neon-cyan)" },
    { label: "COMPLETED", value: data.completedOrders, color: "#00ff88" },
    { label: "REVENUE", value: `$${data.totalRevenue.toFixed(2)}`, color: "#00ff88" },
  ];

  return (
    <main>
      <section className="page-hero">
        <h1>ANALYTICS</h1>
        <p>Business statistics and overview</p>
      </section>

      <section className="dashboard-section">
        <Link href="/dashboard" className="btn-secondary">← BACK</Link>

        <div className="dashboard-grid" style={{ marginTop: "1.5rem" }}>
          {stats.map((s) => (
            <div key={s.label} className="dashboard-card" style={{ textAlign: "center" }}>
              <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem", letterSpacing: "0.1em", fontSize: "0.85rem" }}>{s.label}</p>
              <h3 style={{ color: s.color, fontSize: "2.5rem", WebkitTextStroke: "unset" }}>{s.value}</h3>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "2rem" }}>
          <h2>SALES TREND</h2>
          <div style={{ background: "#181818", padding: "1rem", borderRadius: "8px", marginBottom: "2rem" }}>
            <Line
              data={{
                labels: salesTrend.labels,
                datasets: [
                  {
                    label: "Sales ($)",
                    data: salesTrend.values,
                    borderColor: "#00ff88",
                    backgroundColor: "rgba(0,255,136,0.2)",
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                  title: { display: true, text: "Sales Trend (Completed Orders)" },
                },
              }}
              height={300}
            />
          </div>

          <h2>RECENT ORDERS</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
            {data.recentOrders.length === 0 && <p style={{ color: "var(--text-secondary)" }}>No orders yet.</p>}
            {data.recentOrders.map((o) => (
              <div key={o.id} className="dashboard-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ marginBottom: "0.1rem", fontWeight: "bold" }}>{o.service}</p>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: 0 }}>{o.customer.name} · {new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{ color: STATUS_COLORS[o.status], border: `1px solid ${STATUS_COLORS[o.status]}`, padding: "0.2rem 0.6rem", fontSize: "0.75rem" }}>
                  {o.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
