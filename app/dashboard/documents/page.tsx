"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Doc = { id: string; name: string; url: string; size?: number; uploadedBy?: string; createdAt: string };

export default function DocumentsPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", url: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/documents").then((r) => r.json()).then((d) => { setDocs(d); setLoading(false); });
    }
  }, [status]);

  async function handleAdd() {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, uploadedBy: session?.user?.email }),
    });
    const doc = await res.json();
    setDocs([doc, ...docs]);
    setShowForm(false);
    setForm({ name: "", url: "" });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this document?")) return;
    await fetch(`/api/documents/${id}`, { method: "DELETE" });
    setDocs(docs.filter((d) => d.id !== id));
  }

  if (loading) return <main><section className="page-hero"><h1>LOADING...</h1></section></main>;

  return (
    <main>
      <section className="page-hero">
        <h1>DOCUMENTS</h1>
        <p>Internal documents and resources</p>
      </section>

      <section className="dashboard-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/dashboard" className="btn-secondary">← BACK</Link>
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "CANCEL" : "+ ADD DOCUMENT"}
          </button>
        </div>

        {showForm && (
          <div className="dashboard-card" style={{ marginTop: "1.5rem" }}>
            <h3>ADD DOCUMENT</h3>
            <div className="contact-form" style={{ marginTop: "1rem" }}>
              <div className="form-group">
                <label>DOCUMENT NAME</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Q1 Report" />
              </div>
              <div className="form-group">
                <label>URL / LINK</label>
                <input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
              </div>
              <button className="btn-primary" onClick={handleAdd}>ADD DOCUMENT</button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
          {docs.length === 0 && <p style={{ color: "var(--text-secondary)" }}>No documents yet.</p>}
          {docs.map((doc) => (
            <div key={doc.id} className="dashboard-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3>{doc.name}</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                  {doc.uploadedBy && `Uploaded by ${doc.uploadedBy} · `}{new Date(doc.createdAt).toLocaleDateString()}
                </p>
                <a href={doc.url} target="_blank" rel="noreferrer" style={{ color: "var(--neon-cyan)", fontSize: "0.85rem" }}>
                  OPEN DOCUMENT →
                </a>
              </div>
              <button onClick={() => handleDelete(doc.id)} style={{ color: "var(--neon-red)", background: "none", border: "1px solid var(--neon-red)", padding: "0.2rem 0.6rem", cursor: "pointer", fontSize: "0.75rem" }}>
                DELETE
              </button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
