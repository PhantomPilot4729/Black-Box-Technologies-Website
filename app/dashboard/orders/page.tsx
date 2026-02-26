"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Customer = { id: string; name: string; email?: string };
type Order = { id: string; service: string; status: string; description?: string; price?: number; createdAt: string; customer: Customer };

const STATUS_COLORS: Record<string, string> = {
  PENDING: "var(--neon-yellow)",
  IN_PROGRESS: "var(--neon-cyan)",
  COMPLETED: "#00ff88",
  CANCELLED: "var(--neon-red)",
};

export default function OrdersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerId: "", service: "", description: "", price: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      Promise.all([
        fetch("/api/orders").then((r) => r.json()),
        fetch("/api/customers").then((r) => r.json()),
      ]).then(([o, c]) => { setOrders(o); setCustomers(c); setLoading(false); });
    }
  }, [status]);

  async function handleCreate() {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, price: form.price ? parseFloat(form.price) : null }),
    });
    const order = await res.json();
    setOrders([order, ...orders]);
    setShowForm(false);
    setForm({ customerId: "", service: "", description: "", price: "" });
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    const updated = await res.json();
    setOrders(orders.map((o) => (o.id === id ? updated : o)));
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this order?")) return;
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    setOrders(orders.filter((o) => o.id !== id));
  }

  if (loading) return <main><section className="page-hero"><h1>LOADING...</h1></section></main>;

  return (
    <main>
      <section className="page-hero">
        <h1>ORDERS</h1>
        <p>Manage customer service orders</p>
      </section>

      <section className="dashboard-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/dashboard" className="btn-secondary">← BACK</Link>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "CANCEL" : "+ NEW ORDER"}
          </button>
        </div>

        {showForm && (
          <div className="dashboard-card" style={{ marginTop: "1.5rem" }}>
            <h3>NEW ORDER</h3>
            <div className="contact-form" style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label>CUSTOMER</label>
                <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })}>
                  <option value="">Select customer...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>SERVICE</label>
                <input value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} placeholder="e.g. Data Destruction" />
              </div>
              <div className="form-group">
                <label>DESCRIPTION</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Order details..." />
              </div>
              <div className="form-group">
                <label>PRICE ($)</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              </div>
              <button className="btn-primary" onClick={handleCreate}>CREATE ORDER</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
          {orders.length === 0 && <p style={{ color: "var(--text-secondary)" }}>No orders yet.</p>}
          {orders.map((order) => (
            <div key={order.id} className="dashboard-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div>
                <h3>{order.service}</h3>
                <p style={{ marginBottom: "0.25rem" }}>{order.customer.name}</p>
                {order.description && <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{order.description}</p>}
                {order.price && <p style={{ color: "var(--neon-cyan)", marginBottom: 0 }}>${order.price.toFixed(2)}</p>}
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 0 }}>{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
                <span style={{ color: STATUS_COLORS[order.status], border: `1px solid ${STATUS_COLORS[order.status]}`, padding: "0.2rem 0.6rem", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
                  {order.status.replace("_", " ")}
                </span>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  style={{ background: "var(--background)", color: "var(--text-primary)", border: "1px solid #00f5ff22", padding: "0.25rem", fontSize: "0.75rem" }}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="COMPLETED">COMPLETED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
                <button onClick={() => handleDelete(order.id)} style={{ color: "var(--neon-red)", background: "none", border: "1px solid var(--neon-red)", padding: "0.2rem 0.6rem", cursor: "pointer", fontSize: "0.75rem" }}>
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
