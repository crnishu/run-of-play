"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

interface Props {
  onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "register") {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.error ?? "Registration failed");
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password");
      return;
    }

    onClose();
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,.65)",
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="card fade"
        style={{ width: "100%", maxWidth: 400, padding: "28px 24px", position: "relative" }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 12,
            right: 14,
            background: "none",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
            fontSize: 18,
            lineHeight: 1,
            fontFamily: "var(--font-hanken), sans-serif",
          }}
        >
          ✕
        </button>

        <div className="ttl" style={{ fontSize: 24, color: "var(--lime)", marginBottom: 4 }}>
          {mode === "login" ? "SIGN IN" : "CREATE ACCOUNT"}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 20 }}>
          {mode === "login"
            ? "Sign in to save and load your career."
            : "Create a free account to save your career across devices."}
        </div>

        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div className="lbl" style={{ marginBottom: 6 }}>Email</div>
            <input
              className="nm"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div>
            <div className="lbl" style={{ marginBottom: 6 }}>
              Password{mode === "register" && <span style={{ textTransform: "none", letterSpacing: 0 }}> (min 8 characters)</span>}
            </div>
            <input
              className="nm"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && (
            <div
              style={{
                fontSize: 12,
                color: "#ff6b6b",
                background: "rgba(255,107,107,.08)",
                border: "1px solid rgba(255,107,107,.25)",
                borderRadius: 8,
                padding: "8px 12px",
              }}
            >
              {error}
            </div>
          )}

          <button
            className="btn primary"
            type="submit"
            disabled={loading}
            style={{ width: "100%", marginTop: 4, opacity: loading ? 0.6 : 1 }}
          >
            {loading ? "..." : mode === "login" ? "Sign in →" : "Create account →"}
          </button>
        </form>

        <div style={{ marginTop: 16, textAlign: "center", fontSize: 12, color: "var(--muted)" }}>
          {mode === "login" ? (
            <>
              No account?{" "}
              <button
                onClick={() => { setMode("register"); setError(""); }}
                style={{ background: "none", border: "none", color: "var(--lime)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
              >
                Register for free
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                onClick={() => { setMode("login"); setError(""); }}
                style={{ background: "none", border: "none", color: "var(--lime)", cursor: "pointer", fontFamily: "inherit", fontSize: "inherit" }}
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
