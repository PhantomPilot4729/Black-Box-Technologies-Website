"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountSettings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/customers/login");
    else if (session?.user?.role !== "CUSTOMER") router.push("/");
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated" || session?.user?.role !== "CUSTOMER") {
    return null;
  }

  // Form fields
  const [mailingAddress, setMailingAddress] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [password, setPassword] = useState("");
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [status, setStatus] = useState("");
  const [yubiStatus, setYubiStatus] = useState("");
  // Yubikey registration/authentication
  async function handleRegisterYubiKey() {
    try {
      setYubiStatus("Starting YubiKey registration...");
      const res = await fetch("/api/yubikey/register-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: email })
      });
      if (!res.ok) throw new Error("Failed to get registration challenge");
      const options = await res.json();
      options.challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
      options.user.id = Uint8Array.from(atob(options.user.id.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
      if (options.excludeCredentials) {
        options.excludeCredentials = options.excludeCredentials.map((cred) => ({
          ...cred,
          id: Uint8Array.from(atob(cred.id.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))
        }));
      }
      const cred = await navigator.credentials.create({ publicKey: options });
      if (!cred) throw new Error("No credential returned");
      const attestationResponse = cred.response;
      const credentialJSON = {
        id: cred.id,
        type: cred.type,
        rawId: btoa(String.fromCharCode(...new Uint8Array(cred.rawId))),
        response: {
          clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(attestationResponse.clientDataJSON))),
          attestationObject: btoa(String.fromCharCode(...new Uint8Array(attestationResponse.attestationObject))),
        }
      };
      const storeRes = await fetch("/api/yubikey/register-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: email, attestationResponse: credentialJSON })
      });
      const storeData = await storeRes.json();
      if (storeData.success) {
        setYubiStatus("✅ YubiKey/WebAuthn credential registered and stored!");
      } else {
        setYubiStatus("Credential created but failed to store: " + (storeData.error || "Unknown error"));
      }
    } catch (err) {
      setYubiStatus(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  async function handleAuthenticateYubiKey() {
    try {
      setYubiStatus("Starting YubiKey authentication...");
      const res = await fetch("/api/yubikey/authenticate-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: email })
      });
      if (!res.ok) throw new Error("Failed to get authentication challenge");
      const options = await res.json();
      options.challenge = Uint8Array.from(atob(options.challenge.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0));
      if (options.allowCredentials) {
        options.allowCredentials = options.allowCredentials.map((cred) => ({
          ...cred,
          id: Uint8Array.from(atob(cred.id.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0))
        }));
      }
      const assertion = await navigator.credentials.get({ publicKey: options });
      if (!assertion) throw new Error("No assertion returned");
      const assertionResponse = assertion.response;
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
      const verifyRes = await fetch("/api/yubikey/authenticate-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: email, assertionResponse: assertionJSON })
      });
      const verifyData = await verifyRes.json();
      if (verifyData.success) {
        setYubiStatus("✅ YubiKey authentication successful!");
      } else {
        setYubiStatus("❌ Authentication failed: " + (verifyData.error || "Unknown error"));
      }
    } catch (err) {
      setYubiStatus(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  // Account update handler
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("Saving changes...");
    try {
      const res = await fetch(`/api/customers/${session?.user?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, mailingAddress, billingAddress, password })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("✅ Account updated successfully!");
      } else {
        setStatus("❌ Update failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      setStatus(`❌ Error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return (
    <main>
      <section className="page-hero">
        <h1>ACCOUNT SETTINGS</h1>
        <p>Manage your account information</p>
      </section>
      <section className="dashboard-section">
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="settings-group">
            <label>Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="settings-group">
            <label>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="settings-group">
            <label>Mailing Address</label>
            <input type="text" value={mailingAddress} onChange={e => setMailingAddress(e.target.value)} />
          </div>
          <div className="settings-group">
            <label>Billing Address</label>
            <input type="text" value={billingAddress} onChange={e => setBillingAddress(e.target.value)} />
          </div>
          <div className="settings-group">
            <label>Password</label>
            {!showPasswordSection ? (
              <button type="button" className="btn-secondary" onClick={() => setShowPasswordSection(true)}>
                Authenticate to Change Password
              </button>
            ) : (
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New Password" />
            )}
          </div>
          <button className="btn-primary" type="submit">Save Changes</button>
                  <div style={{ marginTop: "2rem" }}>
                    <h3>YubiKey/WebAuthn</h3>
                    <button className="btn-secondary" type="button" onClick={handleRegisterYubiKey} style={{ marginRight: "1rem" }}>Register YubiKey</button>
                    <button className="btn-primary" type="button" onClick={handleAuthenticateYubiKey}>Authenticate YubiKey</button>
                    {yubiStatus && <p style={{ marginTop: "1rem", color: "var(--neon-cyan)" }}>{yubiStatus}</p>}
                  </div>
                  {status && <p style={{ marginTop: "1rem", color: "var(--neon-cyan)" }}>{status}</p>}
        </form>
      </section>
    </main>
  );
}
