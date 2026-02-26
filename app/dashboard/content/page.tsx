"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const PAGES = [
  { name: "HOME", path: "/", file: "app/page.tsx" },
  { name: "ABOUT", path: "/about", file: "app/about/page.tsx" },
  { name: "SERVICES", path: "/services", file: "app/services/page.tsx" },
  { name: "CONTACT", path: "/contact", file: "app/contact/page.tsx" },
];

export default function ContentPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  if (status === "loading") return <main><section className="page-hero"><h1>LOADING...</h1></section></main>;

  return (
    <main>
      <section className="page-hero">
        <h1>CONTENT EDITOR</h1>
        <p>View and navigate website pages</p>
      </section>

      <section className="dashboard-section">
        <Link href="/dashboard" className="btn-secondary">← BACK</Link>

        <div style={{ marginTop: "2rem" }}>
          <h2>WEBSITE PAGES</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
            To edit page content, update the corresponding file in the project repository.
          </p>
        </div>

        <div className="dashboard-grid" style={{ marginTop: "1.5rem" }}>
          {PAGES.map((page) => (
            <div key={page.path} className="dashboard-card">
              <h3>{page.name}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1rem" }}>
                File: <span style={{ color: "var(--neon-cyan)" }}>{page.file}</span>
              </p>
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <a href={page.path} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem" }}>
                  VIEW PAGE
                </a>
                <a
                  href={`https://github.com/PhantomPilot4729/Black-Box-Technologies-Website/edit/main/${page.file}`}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary"
                  style={{ fontSize: "0.75rem", padding: "0.4rem 0.75rem" }}
                >
                  EDIT ON GITHUB
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-card" style={{ marginTop: "2rem" }}>
          <h3>CONTACT INFORMATION</h3>
          <p style={{ color: "var(--text-secondary)" }}>
            To update contact details shown on the website, edit{" "}
            <a href="https://github.com/PhantomPilot4729/Black-Box-Technologies-Website/edit/main/app/contact/page.tsx" target="_blank" rel="noreferrer" style={{ color: "var(--neon-cyan)" }}>
              app/contact/page.tsx
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
