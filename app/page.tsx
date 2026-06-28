import Link from "next/link";
import Logo from "@/components/Logo";

const sports = [
  {
    href: "/soccer",
    emoji: "⚽",
    name: "Soccer",
    tagline: "One career. No restarts.",
    available: true,
  },
  {
    href: null,
    emoji: "🏀",
    name: "Basketball",
    tagline: "Draft to dynasty.",
    available: false,
  },
  {
    href: null,
    emoji: "🏈",
    name: "Football",
    tagline: "From walk-on to the Hall.",
    available: false,
  },
];

export default function Home() {
  return (
    <div style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column" }}>
      <div style={{ marginBottom: 26, textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, justifyContent: "center" }}>
          <Logo size={58} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
            <span className="ttl" style={{ fontSize: 44, color: "var(--lime)" }}>RYZE</span>
            <span className="ttl" style={{ fontSize: 44 }}>SPORTS</span>
          </div>
        </div>
        <div style={{ height: 3, width: 160, margin: "10px auto 0", borderRadius: 2, background: "linear-gradient(90deg, transparent, var(--brand), transparent)" }} />
        <div style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 10, letterSpacing: 1.5, textTransform: "uppercase" }}>
          Choose your sport · build your legacy
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sports.map((s) =>
          s.available ? (
            <Link key={s.name} href={s.href!} style={{ textDecoration: "none" }}>
              <div
                className="card"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: 0,
                  overflow: "hidden",
                  borderColor: "var(--lime)",
                }}
              >
                <div style={{ width: 6, alignSelf: "stretch", background: "linear-gradient(180deg, #c9ff5a, #a6f02f)" }} />
                <div style={{ fontSize: 38, lineHeight: 1, padding: "16px 0" }}>{s.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div className="ttl" style={{ fontSize: 24, color: "var(--lime)" }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{s.tagline}</div>
                </div>
                <div className="ttl" style={{ paddingRight: 18, color: "var(--lime)", fontSize: 15, letterSpacing: 1.5 }}>
                  PLAY →
                </div>
              </div>
            </Link>
          ) : (
            <div
              key={s.name}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                padding: 0,
                overflow: "hidden",
                opacity: 0.5,
              }}
            >
              <div style={{ width: 6, alignSelf: "stretch", background: "var(--line)" }} />
              <div style={{ fontSize: 38, lineHeight: 1, padding: "16px 0", filter: "grayscale(0.5)" }}>{s.emoji}</div>
              <div style={{ flex: 1 }}>
                <div className="ttl" style={{ fontSize: 24 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{s.tagline}</div>
              </div>
              <div
                style={{
                  marginRight: 16,
                  fontSize: 10,
                  fontFamily: "var(--font-hanken), sans-serif",
                  fontWeight: 700,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  border: "1px solid var(--line)",
                  borderRadius: 6,
                  padding: "4px 9px",
                  whiteSpace: "nowrap",
                }}
              >
                🔒 Soon
              </div>
            </div>
          )
        )}
      </div>

      <Link
        href="/careers"
        style={{
          marginTop: 16,
          textAlign: "center",
          textDecoration: "none",
          color: "var(--gold)",
          fontFamily: "var(--font-anton), sans-serif",
          letterSpacing: 1,
          fontSize: 15,
          padding: "12px",
          border: "1px solid rgba(255,204,61,.35)",
          borderRadius: 12,
          background: "rgba(255,204,61,.05)",
        }}
      >
        📁 MY CAREER CARDS
      </Link>
    </div>
  );
}
