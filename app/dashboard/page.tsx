"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

const EXEC_SECTIONS = [
  { href: "/dashboard/orders", title: "ORDERS", desc: "View and manage customer service orders" },
  { href: "/dashboard/customers", title: "CUSTOMERS", desc: "View and manage customer records" },
  { href: "/dashboard/documents", title: "DOCUMENTS", desc: "Upload and access internal documents" },
  { href: "/dashboard/content", title: "CONTENT EDITOR", desc: "Edit website content and updates" },
  { href: "/dashboard/analytics", title: "ANALYTICS", desc: "View business and site statistics" },
  { href: "/dashboard/settings", title: "ACCOUNT SETTINGS", desc: "Manage password and security keys" },
  { href: "/dashboard/admin", title: "ADMINISTRATION", desc: "Add logins and reassign tiers" },
];
const MGMT_SECTIONS = [
  { href: "/dashboard/orders", title: "ORDERS", desc: "View and manage customer service orders" },
  { href: "/dashboard/customers", title: "CUSTOMERS", desc: "View and manage customer records" },
  { href: "/dashboard/analytics", title: "ANALYTICS", desc: "View business and site statistics" },
  { href: "/dashboard/settings", title: "ACCOUNT SETTINGS", desc: "Manage password and security keys" },
];
const EMP_SECTIONS = [
  { href: "/dashboard/orders", title: "ORDERS", desc: "View customer orders" },
  { href: "/dashboard/settings", title: "ACCOUNT SETTINGS", desc: "Edit YubiKey and password" },
];

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

  // Redirect to tier dashboard
  if (session?.user?.role === "EXECUTIVE") {
    router.replace("/dashboard/executive");
    return null;
  }
  if (session?.user?.role === "MANAGEMENT") {
    router.replace("/dashboard/management");
    return null;
  }
  if (session?.user?.role === "EMPLOYEE") {
    router.replace("/dashboard/employee");
    return null;
  }

  // Determine sections by role
  let sections = EMP_SECTIONS;
  if (session?.user?.role === "EXECUTIVE") sections = EXEC_SECTIONS;
  else if (session?.user?.role === "MANAGEMENT") sections = MGMT_SECTIONS;

  return (
    <main>
      <section className="page-hero">
        <h1>EMPLOYEE DASHBOARD</h1>
        <p>Welcome, {session?.user?.email} <span style={{ color: "var(--neon-cyan)", fontWeight: 600 }}>{session?.user?.role}</span></p>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-grid">
          {sections.map((s) => (
            <Link key={s.href} href={s.href}>
              <div className="dashboard-card">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
        <button
          className="btn-primary"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          SIGN OUT
        </button>
      </section>
    </main>
  );
}