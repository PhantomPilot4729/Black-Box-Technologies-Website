"use client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

export default function EmployeeDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (session?.user?.role !== "EMPLOYEE") router.push("/dashboard");
  }, [status, session, router]);

  if (status === "loading") return <main><section className="page-hero"><h1>LOADING...</h1></section></main>;

  return (
    <main>
      <section className="page-hero">
        <h1>EMPLOYEE DASHBOARD</h1>
        <p>Welcome, {session?.user?.email}</p>
      </section>
      <section className="dashboard-section">
        <div className="dashboard-grid">
          <Link href="/dashboard/orders"><div className="dashboard-card"><h3>ORDERS</h3><p>View customer orders</p></div></Link>
          <Link href="/dashboard/settings"><div className="dashboard-card"><h3>ACCOUNT SETTINGS</h3><p>Edit YubiKey and password</p></div></Link>
        </div>
        <button className="btn-primary" onClick={() => signOut({ callbackUrl: "/" })}>SIGN OUT</button>
      </section>
    </main>
  );
}