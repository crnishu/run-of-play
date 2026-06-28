"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

interface Props {
  onSave: () => Promise<void>;
  onLoad: () => Promise<void>;
  onRequestAuth: () => void;
  saveStatus: "idle" | "saving" | "saved" | "error";
}

export default function SaveBar({ onSave, onLoad, onRequestAuth, saveStatus }: Props) {
  const { data: session, status } = useSession();

  const statusColor =
    saveStatus === "saved" ? "var(--lime)" :
    saveStatus === "error" ? "#ff6b6b" :
    "var(--muted)";

  const statusLabel =
    saveStatus === "saving" ? "Saving…" :
    saveStatus === "saved" ? "Saved" :
    saveStatus === "error" ? "Save failed" :
    "";

  if (status === "loading") return null;

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "7px 14px",
          marginBottom: 8,
          borderRadius: 10,
          background: "var(--panel)",
          border: "1px solid var(--line)",
          fontFamily: "var(--font-hanken), sans-serif",
          fontSize: 12,
          gap: 8,
        }}
      >
        {session ? (
          <>
            <span style={{ color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {session.user?.email}
            </span>
            <div style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
              {statusLabel && (
                <span style={{ fontSize: 11, color: statusColor }}>{statusLabel}</span>
              )}
              <Link
                href="/careers"
                style={{
                  background: "var(--panel2)",
                  border: "1px solid var(--line)",
                  color: "var(--ink)",
                  borderRadius: 6,
                  padding: "3px 10px",
                  cursor: "pointer",
                  fontFamily: "var(--font-hanken), sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                My Careers
              </Link>
              <button
                onClick={onLoad}
                style={{
                  background: "var(--panel2)",
                  border: "1px solid var(--line)",
                  color: "var(--ink)",
                  borderRadius: 6,
                  padding: "3px 10px",
                  cursor: "pointer",
                  fontFamily: "var(--font-hanken), sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Load
              </button>
              <button
                onClick={onSave}
                disabled={saveStatus === "saving"}
                style={{
                  background: "var(--lime)",
                  border: "none",
                  color: "#06200d",
                  borderRadius: 6,
                  padding: "3px 10px",
                  cursor: saveStatus === "saving" ? "default" : "pointer",
                  fontFamily: "var(--font-anton), sans-serif",
                  fontSize: 11,
                  opacity: saveStatus === "saving" ? 0.6 : 1,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                Save
              </button>
              <button
                onClick={() => signOut({ redirect: false })}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-hanken), sans-serif",
                  fontSize: 11,
                  padding: "3px 4px",
                }}
              >
                Sign out
              </button>
            </div>
          </>
        ) : (
          <>
            <span style={{ color: "var(--muted)" }}>Sign in to save your career</span>
            <button
              onClick={onRequestAuth}
              style={{
                background: "var(--lime)",
                border: "none",
                color: "#06200d",
                borderRadius: 6,
                padding: "4px 12px",
                cursor: "pointer",
                fontFamily: "var(--font-anton), sans-serif",
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                flexShrink: 0,
              }}
            >
              Sign in / Register
            </button>
          </>
        )}
      </div>
    </>
  );
}
