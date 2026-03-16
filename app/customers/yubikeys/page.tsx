"use client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function SavedYubiKeys() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/customers/login");
    else if (session?.user?.role !== "CUSTOMER") router.push("/");
  }, [status, session, router]);

  if (status === "loading" || status === "unauthenticated" || session?.user?.role !== "CUSTOMER") {
    return null;
  }

  // Placeholder for YubiKey list
  const yubikeys = [
    { id: 1, name: "YubiKey #1", registered: "2025-12-01" },
    { id: 2, name: "YubiKey #2", registered: "2026-01-15" }
  ];

  return (
    <main>
      <section className="page-hero">
        <h1>SAVED YUBIKEYS</h1>
        <p>Manage your registered YubiKeys</p>
      </section>
      <section className="dashboard-section">
        <ul className="yubikey-list">
          {yubikeys.map(key => (
            <li key={key.id} className="yubikey-item">
              <span>{key.name}</span>
              <span>Registered: {key.registered}</span>
              <button className="btn-secondary">Remove</button>
            </li>
          ))}
        </ul>
        <button className="btn-primary">Register New YubiKey</button>
      </section>
    </main>
  );
}
