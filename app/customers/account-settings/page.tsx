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

  // Placeholder state for form fields
  const [mailingAddress, setMailingAddress] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  const [name, setName] = useState(session?.user?.name || "");
  const [email, setEmail] = useState(session?.user?.email || "");
  const [password, setPassword] = useState("");

  // Password change auth placeholder
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  return (
    <main>
      <section className="page-hero">
        <h1>ACCOUNT SETTINGS</h1>
        <p>Manage your account information</p>
      </section>
      <section className="dashboard-section">
        <form className="settings-form">
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
        </form>
      </section>
    </main>
  );
}
