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
  const { status, data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<'kernel' | 'editor'>('kernel');
  const [kernelKey, setKernelKey] = useState('');
  const [kernelError, setKernelError] = useState('');
  const [yubiEnabled, setYubiEnabled] = useState(false);
  const [yubiStatus, setYubiStatus] = useState('');
  const [showYubiModal, setShowYubiModal] = useState(false);
  const [yubiStatusMsg, setYubiStatusMsg] = useState("");

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

  // Production WebAuthn registration
  async function handleYubiRegister() {
    setYubiStatusMsg("");
    setShowYubiModal(true);
    try {
      // 1. Fetch registration challenge from server (must include user info)
      const userId = session?.user?.email;
      if (!userId) throw new Error("No user email in session");
      const res = await fetch("/api/yubikey/register-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
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
        body: JSON.stringify({ userId, credential: credentialJSON })
      });
      const storeData = await storeRes.json();
      if (storeData.success) {
        setYubiStatusMsg("YubiKey/WebAuthn credential registered and stored!");
      } else {
        setYubiStatusMsg("Credential created but failed to store: " + (storeData.error || "Unknown error"));
      }
    } catch (err) {
      setYubiStatusMsg("YubiKey/WebAuthn registration failed: " + (err instanceof Error ? err.message : String(err)));
    }
  }
// ...existing code...

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

          {/* YubiKey registration placeholder */}
          <div className="dashboard-card" style={{ marginTop: "2rem", border: "2px solid var(--neon-cyan)", background: "#0a192f" }}>
            <h3 style={{ color: "var(--neon-cyan)" }}>YubiKey Registration</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: 12 }}>
              Register a YubiKey to use as a hardware token for kernel key authentication.<br />
              This feature will allow you to unlock the content editor with a physical device for extra security.
            </p>
            <button className="btn-secondary" style={{ width: "100%" }} onClick={handleYubiRegister}>
              REGISTER/USE YUBIKEY
            </button>
            <p style={{ color: "var(--neon-cyan)", fontSize: "0.85rem", marginTop: 8 }}>
              YubiKey support is in progress. Click above to start registration (demo).
            </p>
          </div>

          {/* Modal for YubiKey registration status */}
          {showYubiModal && (
            <div style={{
              position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
            }}>
              <div style={{ background: "#0a192f", border: "2px solid var(--neon-cyan)", borderRadius: 8, padding: 32, minWidth: 320 }}>
                <h2 style={{ color: "var(--neon-cyan)", marginBottom: 16 }}>YubiKey Registration</h2>
                <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>{yubiStatusMsg || "Click the button above and touch your YubiKey when prompted."}</p>
                <button className="btn-primary" style={{ width: "100%" }} onClick={() => setShowYubiModal(false)}>Close</button>
              </div>
            </div>
          )}

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
