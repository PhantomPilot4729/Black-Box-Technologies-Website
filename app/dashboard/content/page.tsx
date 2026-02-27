"use client";

// Handle kernel key submission will be defined inside the component
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

export default function ContentEditor() {
  const { status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<'kernel' | 'editor'>('kernel');
  const [kernelKey, setKernelKey] = useState('');
  const [kernelError, setKernelError] = useState('');
  const [yubiEnabled, setYubiEnabled] = useState(false);
  const [yubiStatus, setYubiStatus] = useState('');

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  // Handle kernel key submission
  async function handleKernelKey() {
    setKernelError("");
    try {
      const res = await fetch("/api/kernelkey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kernelKey }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('editor');
      } else {
        setKernelError(data.error || "Invalid kernel key password.");
      }
    } catch (err) {
      setKernelError("Server error. Please try again later.");
    }
  }

  let content = null;
  if (status === "loading") {
    content = <main><section className="page-hero"><h1>LOADING...</h1></section></main>;
  } else if (step === 'kernel') {
    content = (
      <main>
        <section className="page-hero">
          <h1>INSERT KERNEL KEY</h1>
          <p>Access to the content editor requires a KERNEL KEY.</p>
        </section>
        <section className="dashboard-section">
          <Link href="/dashboard" className="btn-secondary">← BACK</Link>
          <div className="dashboard-card" style={{ marginTop: "2rem", maxWidth: 400 }}>
            <label style={{ fontWeight: 600, color: "var(--neon-cyan)" }}>KERNEL KEY PASSWORD</label>
            <input
              type="password"
              value={kernelKey}
              onChange={e => setKernelKey(e.target.value)}
              placeholder="Enter kernel key password"
              className="input-neon"
              style={{
                marginTop: 8,
                marginBottom: 8,
                width: "100%",
                background: "#0a192f",
                border: "2px solid var(--neon-cyan)",
                color: "var(--neon-cyan)",
                borderRadius: 6,
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                outline: "none",
                boxShadow: "0 0 8px 0 var(--neon-cyan)"
              }}
              onKeyDown={e => { if (e.key === 'Enter') handleKernelKey(); }}
            />
            <button className="btn-primary" style={{ width: "100%" }} onClick={handleKernelKey}>SUBMIT</button>
            {kernelError && <p style={{ color: "var(--neon-red)", marginTop: 8 }}>{kernelError}</p>}
            {yubiEnabled && (
              <div style={{ marginTop: 16 }}>
                <label style={{ fontWeight: 600, color: "var(--neon-cyan)" }}>YUBIKEY (coming soon)</label>
                <button className="btn-secondary" style={{ width: "100%", marginTop: 8 }} disabled>
                  REGISTER/USE YUBIKEY
                </button>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>YubiKey setup is only available after entering the kernel key password.</p>
                {yubiStatus && <p style={{ color: "var(--neon-cyan)", marginTop: 8 }}>{yubiStatus}</p>}
              </div>
            )}
          </div>
        </section>
      </main>
    );
  } else {
    content = (
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

  return content;
}
