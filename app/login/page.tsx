"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState<"password" | "yubikey">("password");

  async function handlePasswordLogin() {
    setStatus("Signing in...");
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (result?.ok) {
      setStatus("✅ Logged in successfully!");
      window.location.href = "/dashboard";
    } else {
      setStatus("❌ Invalid email or password.");
    }
  }

  async function handleRegister() {
    try {
      setStatus("Starting YubiKey registration...");
      const optionsRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const options = await optionsRes.json();
      const registrationResponse = await startRegistration({ optionsJSON: options });
      const verifyRes = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, registrationResponse, expectedChallenge: options.challenge }),
      });
      const result = await verifyRes.json();
      setStatus(result.verified ? "✅ YubiKey registered successfully!" : "❌ Registration failed.");
    } catch (err) {
      setStatus(`❌ Error: ${err}`);
    }
  }

  async function handleYubikeyLogin() {
    try {
      setStatus("Starting YubiKey authentication...");
      const optionsRes = await fetch("/api/auth/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const options = await optionsRes.json();
      const authenticationResponse = await startAuthentication({ optionsJSON: options });
      const verifyRes = await fetch("/api/auth/authenticate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, authenticationResponse, expectedChallenge: options.challenge }),
      });
      const result = await verifyRes.json();
      if (result.verified) {
        setStatus("✅ Logged in successfully!");
        window.location.href = "/dashboard";
      } else {
        setStatus("❌ Authentication failed.");
      }
    } catch (err) {
      setStatus(`❌ Error: ${err}`);
    }
  }

  return (
    <main>
      <section className="page-hero">
        <h1>SECURE LOGIN</h1>
        <p>Access the Black Box Technologies portal</p>
      </section>

      <section className="contact-section">
        <div className="contact-form-wrapper" style={{ maxWidth: "480px", margin: "0 auto" }}>

          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
            <button
              className={activeTab === "password" ? "btn-primary" : "btn-secondary"}
              onClick={() => { setActiveTab("password"); setStatus(""); }}
            >
              PASSWORD
            </button>
            <button
              className={activeTab === "yubikey" ? "btn-primary" : "btn-secondary"}
              onClick={() => { setActiveTab("yubikey"); setStatus(""); }}
            >
              YUBIKEY
            </button>
          </div>

          {activeTab === "password" && (
            <>
              <h2>PASSWORD LOGIN</h2>
              <div className="contact-form">
                <div className="form-group">
                  <label htmlFor="email">EMAIL</label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password">PASSWORD</label>
                  <input
                    type="password"
                    id="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button className="btn-primary" style={{ marginTop: "1rem" }} onClick={handlePasswordLogin}>
                  SIGN IN
                </button>
              </div>
            </>
          )}

          {activeTab === "yubikey" && (
            <>
              <h2>YUBIKEY AUTHENTICATION</h2>
              <div className="contact-form">
                <div className="form-group">
                  <label htmlFor="yubikey-email">EMAIL</label>
                  <input
                    type="email"
                    id="yubikey-email"
                    placeholder="Your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button className="btn-primary" onClick={handleYubikeyLogin}>
                    LOGIN
                  </button>
                  <button className="btn-secondary" onClick={handleRegister}>
                    REGISTER KEY
                  </button>
                </div>
              </div>
            </>
          )}

          {status && (
            <p style={{ marginTop: "1.5rem", color: "var(--neon-cyan)" }}>{status}</p>
          )}
        </div>
      </section>
    </main>
  );
}