"use client";

import { useState } from "react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function handleRegister() {
    try {
      setStatus("Starting registration...");
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
        body: JSON.stringify({
          email,
          registrationResponse,
          expectedChallenge: options.challenge,
        }),
      });
      const result = await verifyRes.json();

      if (result.verified) {
        setStatus("✅ YubiKey registered successfully!");
      } else {
        setStatus("❌ Registration failed.");
      }
    } catch (err) {
      setStatus(`❌ Error: ${err}`);
    }
  }

  async function handleLogin() {
    try {
      setStatus("Starting authentication...");
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
        body: JSON.stringify({
          email,
          authenticationResponse,
          expectedChallenge: options.challenge,
        }),
      });
      const result = await verifyRes.json();

      if (result.verified) {
        setStatus("✅ Logged in successfully!");
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
        <p>Authenticate using your YubiKey security token</p>
      </section>

      <section className="contact-section">
        <div className="contact-form-wrapper" style={{ maxWidth: "480px", margin: "0 auto" }}>
          <h2>YUBIKEY AUTHENTICATION</h2>
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
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button className="btn-primary" onClick={handleRegister}>
                REGISTER YUBIKEY
              </button>
              <button className="btn-primary" onClick={handleLogin}>
                LOGIN
              </button>
            </div>
            {status && (
              <p style={{ marginTop: "1rem", color: "var(--neon-cyan)" }}>{status}</p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}