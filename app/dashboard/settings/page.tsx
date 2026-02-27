"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { startRegistration } from "@simplewebauthn/browser";

export default function SettingsPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const [status2, setStatus2] = useState("");
  const [passwordForm, setPasswordForm] = useState({ current: "", newPass: "", confirm: "" });
  const [yubikeys, setYubikeys] = useState([]);
  const [loadingYubikeys, setLoadingYubikeys] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      setLoadingYubikeys(true);
      fetch(`/api/auth/credentials?email=${encodeURIComponent(session.user.email)}`)
        .then(res => res.json())
        .then(data => {
          setYubikeys(data.credentials || []);
          setLoadingYubikeys(false);
        })
        .catch(() => setLoadingYubikeys(false));
    }
  }, [session?.user?.email]);
  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  async function handleRegisterYubikey() {
    if (!session?.user?.email) return;
    try {
      setStatus2("Starting YubiKey registration...");
      const optionsRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email }),
      });
      const options = await optionsRes.json();
      const registrationResponse = await startRegistration({ optionsJSON: options });
      const verifyRes = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session.user.email, registrationResponse, expectedChallenge: options.challenge }),
      });
      const result = await verifyRes.json();
      setStatus2(result.verified ? "✅ YubiKey registered successfully!" : "❌ Registration failed.");
    } catch (err) {
      setStatus2(`❌ Error: ${err}`);
    }
  }

  async function handlePasswordChange() {
    if (passwordForm.newPass !== passwordForm.confirm) {
      setStatus2("❌ New passwords do not match.");
      return;
    }
    setStatus2("⚠️ Password changes require updating the credentials in the codebase. Contact your system administrator.");
  }

  if (status === "loading") return <main><section className="page-hero"><h1>LOADING...</h1></section></main>;

  return (
    <main>
      <section className="page-hero">
        <h1>ACCOUNT SETTINGS</h1>
        <p>Manage your security and authentication</p>
      </section>

      <section className="dashboard-section">
        <Link href="/dashboard" className="btn-secondary">← BACK</Link>

        <div className="dashboard-card" style={{ marginTop: "1.5rem" }}>
          <h3>ACCOUNT INFO</h3>
          <p style={{ marginTop: "0.5rem" }}>Email: <span style={{ color: "var(--neon-cyan)" }}>{session?.user?.email}</span></p>
        </div>

        <div className="dashboard-card" style={{ marginTop: "1.5rem" }}>
          <h3>YUBIKEY MANAGEMENT</h3>
          <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Register an additional YubiKey for this account.
          </p>
          <button className="btn-primary" onClick={handleRegisterYubikey}>
            REGISTER NEW YUBIKEY
          </button>
          <div style={{ marginTop: "1rem" }}>
            <strong>Registered YubiKeys:</strong>
            {loadingYubikeys ? (
              <p>Loading...</p>
            ) : yubikeys.length === 0 ? (
              <p style={{ color: "var(--text-secondary)" }}>No YubiKeys registered.</p>
            ) : (
              <ul style={{ marginTop: "0.5rem" }}>
                {yubikeys.map((cred) => (
                  <li key={cred.credentialId} style={{ color: "var(--neon-cyan)" }}>
                    YubiKey ID: {cred.credentialId}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        </div>

        <div className="dashboard-card" style={{ marginTop: "1.5rem" }}>
          <h3>CHANGE PASSWORD</h3>
          <div className="contact-form" style={{ marginTop: "1rem" }}>
            <div className="form-group">
              <label>CURRENT PASSWORD</label>
              <input type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} placeholder="Current password" />
            </div>
            <div className="form-group">
              <label>NEW PASSWORD</label>
              <input type="password" value={passwordForm.newPass} onChange={(e) => setPasswordForm({ ...passwordForm, newPass: e.target.value })} placeholder="New password" />
            </div>
            <div className="form-group">
              <label>CONFIRM NEW PASSWORD</label>
              <input type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Confirm new password" />
            </div>
            <button className="btn-primary" onClick={handlePasswordChange}>UPDATE PASSWORD</button>
          </div>
        </div>

        {status2 && <p style={{ marginTop: "1rem", color: "var(--neon-cyan)" }}>{status2}</p>}
      </section>
    </main>
  );
}
