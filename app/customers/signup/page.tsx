"use client";
import { useState } from "react";
import Link from "next/link";

export default function CustomerSignup() {
      const [initYubiKey, setInitYubiKey] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mailingLine1, setMailingLine1] = useState("");
  const [mailingLine2, setMailingLine2] = useState("");
  const [mailingCity, setMailingCity] = useState("");
  const [mailingState, setMailingState] = useState("");
  const [mailingZip, setMailingZip] = useState("");

  const [billingLine1, setBillingLine1] = useState("");
  const [billingLine2, setBillingLine2] = useState("");
  const [billingCity, setBillingCity] = useState("");
  const [billingState, setBillingState] = useState("");
  const [billingZip, setBillingZip] = useState("");
  const [sameAsMailing, setSameAsMailing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [yubiKeyStatus, setYubiKeyStatus] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!name || !email || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    // Standard signup logic here (API call to create user)
    // ...existing code...
    if (initYubiKey) {
      setYubiKeyStatus("Initializing YubiKey...");
      try {
        // Step 1: Get registration options from server
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const options = await res.json();
        // Step 2: Start WebAuthn registration
        // @ts-ignore
        const credential = await navigator.credentials.create({ publicKey: options });
        // Step 3: Send response to server for verification (not implemented here, but you can add)
        // setYubiKeyStatus("YubiKey registration successful!");
        setYubiKeyStatus("YubiKey registration flow started. Complete device prompt.");
      } catch (err) {
        setYubiKeyStatus("YubiKey registration failed.");
      }
    }
    setSuccess("Account created! You can now log in.");
  };

  return (
    <main>
      <section className="page-hero">
        <h1>CUSTOMER SIGN UP</h1>
        <p>Create your account to access features</p>
      </section>
      <section className="dashboard-section">
        <form className="settings-form" onSubmit={handleSubmit}>
          {initYubiKey && yubiKeyStatus && (
            <div className="form-group">
              <p>{yubiKeyStatus}</p>
            </div>
          )}
          <div className="form-group">
            <label>
              <input type="checkbox" checked={initYubiKey} onChange={e => setInitYubiKey(e.target.checked)} /> Initialize YubiKey during signup (optional)
            </label>
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} /> Remember this browser for 30 days
            </label>
          </div>
          <div className="form-group">
            <label>Name</label>
            <input className="form-input" type="text" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Mailing Address</label>
            <input className="form-input" type="text" placeholder="Address Line 1" value={mailingLine1} onChange={e => setMailingLine1(e.target.value)} required />
            <input className="form-input" type="text" placeholder="Address Line 2 (optional)" value={mailingLine2} onChange={e => setMailingLine2(e.target.value)} />
            <input className="form-input" type="text" placeholder="City" value={mailingCity} onChange={e => setMailingCity(e.target.value)} required />
            <input className="form-input" type="text" placeholder="State" value={mailingState} onChange={e => setMailingState(e.target.value)} required />
            <input className="form-input" type="text" placeholder="Zip Code" value={mailingZip} onChange={e => setMailingZip(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>
              <input type="checkbox" checked={sameAsMailing} onChange={e => setSameAsMailing(e.target.checked)} /> Billing address same as mailing address
            </label>
          </div>
          {!sameAsMailing && (
            <div className="form-group">
              <label>Billing Address</label>
              <input className="form-input" type="text" placeholder="Address Line 1" value={billingLine1} onChange={e => setBillingLine1(e.target.value)} required />
              <input className="form-input" type="text" placeholder="Address Line 2 (optional)" value={billingLine2} onChange={e => setBillingLine2(e.target.value)} />
              <input className="form-input" type="text" placeholder="City" value={billingCity} onChange={e => setBillingCity(e.target.value)} required />
              <input className="form-input" type="text" placeholder="State" value={billingState} onChange={e => setBillingState(e.target.value)} required />
              <input className="form-input" type="text" placeholder="Zip Code" value={billingZip} onChange={e => setBillingZip(e.target.value)} required />
            </div>
          )}
          {error && <p className="login-error">{error}</p>}
          {success && <p style={{ color: "var(--neon-cyan)" }}>{success}</p>}
          <button className="btn-primary" type="submit">Sign Up</button>
        </form>
        <p>Already have an account? <Link href="/customers/login">Login here</Link></p>
      </section>
    </main>
  );
}
