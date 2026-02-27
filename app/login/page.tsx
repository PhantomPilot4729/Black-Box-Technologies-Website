"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";


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
      // 1. Fetch registration challenge from server (POST, include user email)
      const res = await fetch("/api/yubikey/register-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: email })
      });
      if (!res.ok) throw new Error("Failed to get registration challenge");
      const options = await res.json();
      // 2. Convert binary fields from base64url to Uint8Array
      options.challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
      options.user.id = Uint8Array.from(atob(options.user.id.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map((cred: any) => ({
          ...cred,
          id: Uint8Array.from(atob(cred.id.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))
        }));
      }
      // 3. Call WebAuthn API
      const cred = await navigator.credentials.create({ publicKey: options }) as PublicKeyCredential;
      if (!cred) throw new Error("No credential returned");
      const attestationResponse = cred.response as AuthenticatorAttestationResponse;
      // 4. Prepare credential for server
      const credentialJSON = {
        id: cred.id,
        type: cred.type,
        rawId: btoa(String.fromCharCode(...new Uint8Array(cred.rawId))),
        response: {
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(attestationResponse.clientDataJSON))),
          attestationObject: btoa(String.fromCharCode(...new Uint8Array(attestationResponse.attestationObject))),
        }
      };
      // 5. Send credential to server for verification/storage
      const storeRes = await fetch("/api/yubikey/register-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: email, credential: credentialJSON })
      });
      const storeData = await storeRes.json();
      if (storeData.success) {
        setStatus("✅ YubiKey/WebAuthn credential registered and stored!");
      } else {
        setStatus("Credential created but failed to store: " + (storeData.error || "Unknown error"));
      }
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function handleYubikeyLogin() {
    try {
      setStatus("Starting YubiKey authentication...");
      // 1. Fetch authentication challenge from server (POST, include user email)
      const res = await fetch("/api/yubikey/authenticate-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: email })
      });
      if (!res.ok) throw new Error("Failed to get authentication challenge");
      const options = await res.json();
      // 2. Convert binary fields from base64url to Uint8Array
      options.challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map((cred: any) => ({
          ...cred,
          id: Uint8Array.from(atob(cred.id.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))
        }));
      }
      // 3. Call WebAuthn API
      const assertion = await navigator.credentials.get({ publicKey: options }) as PublicKeyCredential;
      if (!assertion) throw new Error("No assertion returned");
      const assertionResponse = assertion.response as AuthenticatorAssertionResponse;
      // 4. Prepare assertion for server
      const assertionJSON = {
        id: assertion.id,
        type: assertion.type,
        rawId: btoa(String.fromCharCode(...new Uint8Array(assertion.rawId))),
        response: {
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(assertionResponse.clientDataJSON))),
          authenticatorData: btoa(String.fromCharCode(...new Uint8Array(assertionResponse.authenticatorData))),
          signature: btoa(String.fromCharCode(...new Uint8Array(assertionResponse.signature))),
          userHandle: assertionResponse.userHandle ? btoa(String.fromCharCode(...new Uint8Array(assertionResponse.userHandle))) : null,
        }
      };
      // 5. Send assertion to server for verification
      const verifyRes = await fetch("/api/yubikey/authenticate-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: email, assertion: assertionJSON })
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setStatus("✅ Logged in successfully!");
        window.location.href = "/dashboard";
      } else {
        setStatus("❌ Authentication failed: " + (verifyData.error || "Unknown error"));
      }
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
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
                    REGISTER YUBIKEY
                  </button>
                </div>
              </div>
              <p style={{ color: "var(--text-secondary)", marginTop: "1rem" }}>
                To register a new YubiKey, log in and visit <b>Account Settings</b> in the dashboard.
              </p>
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