"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function ExecutiveDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (session?.user?.role !== "EXECUTIVE") router.push("/dashboard");
  }, [status, session, router]);

  if (status === "loading") return <main><section className="page-hero"><h1>LOADING...</h1></section></main>;

  return (
    <main>
      <section className="page-hero">
        <h1>EXECUTIVE DASHBOARD</h1>
        <p>Welcome, {session?.user?.email}</p>
      </section>
      <section className="dashboard-section">
        <div className="dashboard-grid">
          <Link href="/dashboard/orders"><div className="dashboard-card"><h3>ORDERS</h3><p>Manage all orders</p></div></Link>
          <Link href="/dashboard/customers"><div className="dashboard-card"><h3>CUSTOMERS</h3><p>Manage all customers</p></div></Link>
          <Link href="/dashboard/documents"><div className="dashboard-card"><h3>DOCUMENTS</h3><p>Access and upload documents</p></div></Link>
          <Link href="/dashboard/content"><div className="dashboard-card"><h3>CONTENT EDITOR</h3><p>Edit website content</p></div></Link>
          <Link href="/dashboard/analytics"><div className="dashboard-card"><h3>ANALYTICS</h3><p>View business stats</p></div></Link>
          <Link href="/dashboard/settings"><div className="dashboard-card"><h3>ACCOUNT SETTINGS</h3><p>Manage password, YubiKey</p></div></Link>
          <Link href="/dashboard/admin"><div className="dashboard-card"><h3>ADMINISTRATION</h3><p>Add logins, reassign tiers</p></div></Link>
        </div>
        <button className="btn-primary" onClick={() => signOut({ callbackUrl: "/" })}>SIGN OUT</button>
      </section>
    </main>
  );
}