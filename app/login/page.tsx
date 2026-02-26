"use client";

import { useState } from "react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  async function handleRegister() {
    try {
      setStatus("Starting registration...");
      const optionsRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const options = await optionsRes.json();

      const registrationResponse = await startRegistration({ optionsJSON: options });

      const verifyRes = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          registrationResponse,
          expectedChallenge: options.challenge,
        }),
      });
      const result = await verifyRes.json();

      if (result.verified) {
        setStatus("✅ YubiKey registered successfully!");
      } else {
        setStatus("❌ Registration failed.");
      }
    } catch (err) {
      setStatus(`❌ Error: ${err}`);
    }
  }

  async function handleLogin() {
    try {
      setStatus("Starting authentication...");
      const optionsRes = await fetch("/api/auth/authenticate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const options = await optionsRes.json();

      const authenticationResponse = await startAuthentication({ optionsJSON: options });

      const verifyRes = await fetch("/api/auth/authenticate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          authenticationResponse,
          expectedChallenge: options.challenge,
        }),
      });
      const result = await verifyRes.json();

      if (result.verified) {
        setStatus("✅ Logged in successfully!");
      } else {
        setStatus("❌ Authentication failed.");
      }
    } catch (err) {
      setStatus(`❌ Error: ${err}`);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold">Login with YubiKey</h1>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-64"
      />
      <div className="flex gap-4">
        <button
          onClick={handleRegister}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Register YubiKey
        </button>
        <button
          onClick={handleLogin}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Login with YubiKey
        </button>
      </div>
      {status && <p className="mt-4">{status}</p>}
    </div>
  );
}