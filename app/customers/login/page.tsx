"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CustomerLogin() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "CUSTOMER") {
      router.push("/customers/account-settings");
    }
  }, [status, session, router]);

  if (status === "loading") return <main><section className="page-hero"><h1>LOADING...</h1></section></main>;

  const [rememberMe, setRememberMe] = useState(false);
  return (
    <main>
      <section className="page-hero">
        <h1>CUSTOMER LOGIN</h1>
        <p>Sign in to access your account</p>
      </section>
      <section className="dashboard-section">
        <div className="dashboard-grid">
          <div className="form-group">
            <label>
              <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} /> Remember this browser for 30 days
            </label>
          </div>
          <button className="btn-primary" onClick={() => signIn(undefined, { callbackUrl: "/customers/account-settings", rememberMe })}>SIGN IN</button>
        </div>
        <Link href="/customers/account-settings"><div className="dashboard-card"><h3>ACCOUNT SETTINGS</h3><p>Manage your account</p></div></Link>
        <Link href="/customers/yubikeys"><div className="dashboard-card"><h3>SAVED YUBIKEYS</h3><p>View and manage YubiKeys</p></div></Link>
        <Link href="/customers/orders"><div className="dashboard-card"><h3>RECENT ORDERS</h3><p>View your orders</p></div></Link>
        <button className="btn-primary" onClick={() => signOut({ callbackUrl: "/" })}>SIGN OUT</button>
      </section>
    </main>
  );
}
