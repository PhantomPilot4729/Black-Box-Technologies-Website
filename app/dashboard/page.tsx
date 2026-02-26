"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main>
        <section className="page-hero">
          <h1>LOADING...</h1>
        </section>
      </main>
    );
  }

  return (
    <main>
      <section className="page-hero">
        <h1>EMPLOYEE DASHBOARD</h1>
        <p>Welcome, {session?.user?.email}</p>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>DOCUMENTS</h3>
            <p>Access internal documents and resources</p>
          </div>
          <div className="dashboard-card">
            <h3>ORDERS</h3>
            <p>Manage customer orders and requests</p>
          </div>
          <div className="dashboard-card">
            <h3>CONTENT</h3>
            <p>Edit website content and updates</p>
          </div>
        </div>
        <button
          className="btn-primary btn-dark"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          SIGN OUT
        </button>
      </section>
    </main>
  );
}