"use client";

import { Line } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/analytics").then((r) => r.json()).then((d) => {
        setData(d);
        // setLoading(false); // Remove if not using loading state
      });
    }
  }, [status, router]);

  // Prepare salesTrend data
  const salesTrend = {
    labels: data && Array.isArray(data.recentOrders)
      ? data.recentOrders.map((order) => new Date(order.createdAt).toLocaleDateString())
      : [],
    values: data && Array.isArray(data.recentOrders)
      ? data.recentOrders.map((order) => order.status === "COMPLETED" ? data.totalRevenue : 0)
      : [],
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <h2>SALES TREND</h2>
      <div>
        <Line
          data={{
            labels: salesTrend.labels,
            datasets: [
              {
                label: "Sales ($)",
                data: salesTrend.values,
                borderColor: "var(--neon-cyan)",
                backgroundColor: "rgba(0,255,136,0.15)",
                pointBackgroundColor: "var(--neon-cyan)",
                pointBorderColor: "#00ff88",
                pointHoverBackgroundColor: "var(--neon-yellow)",
                pointHoverBorderColor: "var(--neon-yellow)",
                tension: 0.4,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: true,
                labels: {
                  color: "var(--neon-cyan)",
                  font: {
                    size: 14,
                    family: "'Orbitron', 'Montserrat', 'sans-serif'",
                    weight: "bold",
                  },
                },
              },
              title: {
                display: true,
                text: "Sales Trend (Completed Orders)",
                color: "var(--neon-cyan)",
                font: {
                  size: 18,
                  family: "'Orbitron', 'Montserrat', 'sans-serif'",
                  weight: "bold",
                },
              },
              tooltip: {
                backgroundColor: "#0a192f",
                titleColor: "var(--neon-cyan)",
                bodyColor: "#00ff88",
                borderColor: "var(--neon-cyan)",
                borderWidth: 2,
              },
            },
            scales: {
              x: {
                grid: {
                  color: "rgba(0,255,136,0.15)",
                },
                ticks: {
                  color: "var(--neon-cyan)",
                  font: {
                    size: 12,
                    family: "'Orbitron', 'Montserrat', 'sans-serif'",
                  },
                },
              },
              y: {
                grid: {
                  color: "rgba(0,255,136,0.15)",
                },
                ticks: {
                  color: "#00ff88",
                  font: {
                    size: 12,
                    family: "'Orbitron', 'Montserrat', 'sans-serif'",
                  },
                },
              },
            },
          }}
          height={300}
        />
      </div>
      <h2>RECENT ORDERS</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
        {data && Array.isArray(data.recentOrders) && data.recentOrders.length === 0 && (
          <p style={{ color: "var(--text-secondary)" }}>No orders yet.</p>
        )}
        {data && Array.isArray(data.recentOrders) && data.recentOrders.map((o: Analytics['recentOrders'][0]) => (
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
  );
}
