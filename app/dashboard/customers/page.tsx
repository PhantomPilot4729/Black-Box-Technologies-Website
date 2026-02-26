"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Customer = { id: string; name: string; email?: string; phone?: string; company?: string; notes?: string; createdAt: string; _count: { orders: number } };

export default function CustomersPage() {
  const { status } = useSession();
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", notes: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/customers").then((r) => r.json()).then((c) => { setCustomers(c); setLoading(false); });
    }
  }, [status]);

  async function handleSave() {
    if (editId) {
      const res = await fetch(`/api/customers/${editId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const updated = await res.json();
      setCustomers(customers.map((c) => (c.id === editId ? { ...c, ...updated } : c)));
      setEditId(null);
    } else {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setCustomers([{ ...created, _count: { orders: 0 } }, ...customers]);
    }
    setShowForm(false);
    setForm({ name: "", email: "", phone: "", company: "", notes: "" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this customer? This will also delete their orders.")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    setCustomers(customers.filter((c) => c.id !== id));
  }

  function handleEdit(c: Customer) {
    setForm({ name: c.name, email: c.email ?? "", phone: c.phone ?? "", company: c.company ?? "", notes: c.notes ?? "" });
    setEditId(c.id);
    setShowForm(true);
  }

  if (loading) return <main><section className="page-hero"><h1>LOADING...</h1></section></main>;

  return (
    <main>
      <section className="page-hero">
        <h1>CUSTOMERS</h1>
        <p>Manage customer records</p>
      </section>

      <section className="dashboard-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/dashboard" className="btn-secondary">← BACK</Link>
          <button className="btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ name: "", email: "", phone: "", company: "", notes: "" }); }}>
            {showForm ? "CANCEL" : "+ NEW CUSTOMER"}
          </button>
        </div>

        {showForm && (
          <div className="dashboard-card" style={{ marginTop: "1.5rem" }}>
            <h3>{editId ? "EDIT CUSTOMER" : "NEW CUSTOMER"}</h3>
            <div className="contact-form" style={{ marginTop: "1rem" }}>
              {[
                { key: "name", label: "NAME *", placeholder: "Full name" },
                { key: "email", label: "EMAIL", placeholder: "email@example.com" },
                { key: "phone", label: "PHONE", placeholder: "+1 (000) 000-0000" },
                { key: "company", label: "COMPANY", placeholder: "Company name" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} className="form-group">
                  <label>{label}</label>
                  <input value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} />
                </div>
              ))}
              <div className="form-group">
                <label>NOTES</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Additional notes..." />
              </div>
              <button className="btn-primary" onClick={handleSave}>{editId ? "SAVE CHANGES" : "CREATE CUSTOMER"}</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
          {customers.length === 0 && <p style={{ color: "var(--text-secondary)" }}>No customers yet.</p>}
          {customers.map((c) => (
            <div key={c.id} className="dashboard-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <h3>{c.name}</h3>
                {c.company && <p style={{ color: "var(--neon-cyan)", marginBottom: "0.25rem" }}>{c.company}</p>}
                {c.email && <p style={{ marginBottom: "0.25rem" }}>{c.email}</p>}
                {c.phone && <p style={{ marginBottom: "0.25rem" }}>{c.phone}</p>}
                {c.notes && <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{c.notes}</p>}
                <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: 0 }}>{c._count.orders} order(s) · {new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={() => handleEdit(c)} style={{ color: "var(--neon-cyan)", background: "none", border: "1px solid var(--neon-cyan)", padding: "0.2rem 0.6rem", cursor: "pointer", fontSize: "0.75rem" }}>
                  EDIT
                </button>
                <button onClick={() => handleDelete(c.id)} style={{ color: "var(--neon-red)", background: "none", border: "1px solid var(--neon-red)", padding: "0.2rem 0.6rem", cursor: "pointer", fontSize: "0.75rem" }}>
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
