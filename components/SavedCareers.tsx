"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CareerCard from "./CareerCard";
import AuthModal from "./AuthModal";
import Flag from "./ui/Flag";
import { cardTier } from "@/lib/helpers";
import type { Player, Career, Season } from "@/lib/types";

interface CareerSummary {
  name: string;
  flag: string;
  country: string;
  position: string;
  academy: string;
  peakOvr: number;
  ageStart: number;
  ageEnd: number;
  seasons: number;
  score: number;
  tier: string;
  color: string;
  emoji: string;
  apps: number;
  goals: number;
  assists: number;
  caps: number;
  ballonDors: number;
  worldCups: number;
  contCups: number;
  ucls: number;
  leagueTitles: number;
  cups: number;
}

interface CareerListItem {
  id: string;
  name: string;
  sport: string;
  summary: CareerSummary;
  createdAt: string;
}

interface FullCareer {
  player: Player;
  career: Career;
  history: Season[];
}

export default function SavedCareers() {
  const { status } = useSession();
  const [careers, setCareers] = useState<CareerListItem[] | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [viewing, setViewing] = useState<FullCareer | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    fetch("/api/careers")
      .then((r) => (r.ok ? r.json() : { careers: [] }))
      .then((d) => { if (active) setCareers(d.careers ?? []); })
      .catch(() => { if (active) setCareers([]); });
    return () => { active = false; };
  }, [status]);

  async function openCareer(id: string) {
    setLoadingView(true);
    try {
      const res = await fetch(`/api/careers/${id}`);
      if (!res.ok) return;
      const { career } = await res.json();
      setViewing(career.data as FullCareer);
    } catch { /* ignore */ }
    finally { setLoadingView(false); }
  }

  async function deleteCareer(id: string) {
    if (!confirm("Delete this saved career? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/careers/${id}`, { method: "DELETE" });
      if (res.ok) setCareers((prev) => prev?.filter((c) => c.id !== id) ?? null);
    } catch { /* ignore */ }
    finally { setDeletingId(null); }
  }

  // --- Detail overlay ---
  if (viewing) {
    return (
      <div className="scuk" style={{ background: "#0a1410" }}>
        <CareerCard
          player={viewing.player}
          career={viewing.career}
          history={viewing.history}
          restartLabel="← Back to my careers"
          onRestart={() => setViewing(null)}
        />
      </div>
    );
  }

  // --- Loading session ---
  if (status === "loading") {
    return (
      <div style={{ width: "100%", maxWidth: 480, textAlign: "center", color: "var(--muted)", padding: 40 }}>
        Loading…
      </div>
    );
  }

  // --- Not signed in ---
  if (status === "unauthenticated") {
    return (
      <div style={{ width: "100%", maxWidth: 480 }}>
        <TitleBar />
        <div className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔒</div>
          <div className="ttl" style={{ fontSize: 20, marginBottom: 6 }}>Sign in to view your careers</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
            Your saved careers are tied to your account.
          </div>
          <button className="btn primary" style={{ width: "100%" }} onClick={() => setShowAuth(true)}>
            Sign in / Register
          </button>
        </div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    );
  }

  // --- Signed in ---
  return (
    <div style={{ width: "100%", maxWidth: 480 }}>
      <TitleBar />

      {loadingView && (
        <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 12, marginBottom: 8 }}>
          Opening career…
        </div>
      )}

      {careers === null ? (
        <div style={{ textAlign: "center", color: "var(--muted)", padding: 40 }}>Loading your careers…</div>
      ) : careers.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📁</div>
          <div className="ttl" style={{ fontSize: 20, marginBottom: 6 }}>No saved careers yet</div>
          <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 18 }}>
            Finish a career and hit “Save to my careers” to start your collection.
          </div>
          <Link href="/soccer" className="btn primary" style={{ display: "block", width: "100%", textDecoration: "none", textAlign: "center" }}>
            Play a career →
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
          {careers.map((c) => {
            const s = c.summary;
            const trophies =
              (s.ballonDors ?? 0) + (s.worldCups ?? 0) + (s.contCups ?? 0) +
              (s.ucls ?? 0) + (s.leagueTitles ?? 0) + (s.cups ?? 0);
            return (
              <div
                key={c.id}
                className={`futmini fut--${cardTier(s.tier)}`}
                onClick={() => openCareer(c.id)}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); deleteCareer(c.id); }}
                  disabled={deletingId === c.id}
                  aria-label="Delete career"
                  style={{
                    position: "absolute", top: 7, right: 10, zIndex: 5,
                    background: "rgba(0,0,0,.18)", border: "none", color: "inherit",
                    borderRadius: "50%", width: 20, height: 20, cursor: "pointer",
                    fontSize: 11, lineHeight: 1, padding: 0,
                  }}
                >
                  {deletingId === c.id ? "…" : "✕"}
                </button>
                <div className="futmini__inner">
                  <div style={{ textAlign: "center", lineHeight: .82, flexShrink: 0, width: 44 }}>
                    <div style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: 30 }}>{s.score}</div>
                    <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, opacity: .7, marginTop: 2 }}>{s.position}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: 17, textTransform: "uppercase", lineHeight: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <Flag emoji={s.flag} size={16} /> {s.name}
                    </div>
                    <div style={{ fontSize: 10.5, fontWeight: 700, opacity: .8, marginTop: 4 }}>
                      Peak {s.peakOvr} · {s.seasons} seasons{trophies > 0 ? ` · ${trophies}🏆` : ""}
                    </div>
                    <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", opacity: .72, marginTop: 3 }}>
                      {s.emoji} {s.tier}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TitleBar() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div className="ttl" style={{ fontSize: 26, color: "var(--lime)" }}>MY CAREERS</div>
      <Link href="/" style={{ fontSize: 12, color: "var(--muted)", textDecoration: "none", fontFamily: "var(--font-hanken), sans-serif" }}>
        ← Home
      </Link>
    </div>
  );
}
