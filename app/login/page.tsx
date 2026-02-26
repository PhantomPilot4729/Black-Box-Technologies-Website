"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid email or password.");
    }
  };

  return (
    <main>
      <section className="page-hero">
        <h1>EMPLOYEE LOGIN</h1>
        <p>Authorized personnel only</p>
      </section>

      <section className="login-section">
        <div className="login-form-wrapper">
          <div className="login-form">
            {error && <p className="login-error">{error}</p>}
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
            <button className="btn-primary btn-dark" onClick={handleLogin}>
              LOGIN
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}