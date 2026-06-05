const SECTIONS = [
  {
    label: "Setup",
    body: "Pick your nationality, position, and name. Your youth academy is drawn at random — fate decides where you start.",
  },
  {
    label: "Seasons",
    body: "Each season runs automatically. Minutes played depends on your OVR vs your club's level. More game time means more growth.",
  },
  {
    label: "OVR & decline",
    body: "You improve quickly while young. Growth slows in your mid-twenties, then age takes over. Peak OVR is everything.",
  },
  {
    label: "Decisions",
    body: "Off-season choices shape your arc — play through injury, demand a raise, accept the captaincy. Every option has a cost.",
  },
  {
    label: "Transfers",
    body: "Contracts expire and clubs come calling. You can also hand in a transfer request — but your current club may block it.",
  },
  {
    label: "The score",
    body: "Your career ends with a Legacy tier and a Score /100 based on peak OVR and trophies. Screenshot and compare with friends.",
  },
];

export default function HowToPlay({ onBack, isFirst }: { onBack: () => void; isFirst: boolean }) {
  return (
    <div className="fade">
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <div className="ttl" style={{ fontSize: 30, color: "var(--lime)" }}>HOW TO</div>
        <div className="ttl" style={{ fontSize: 30 }}>PLAY</div>
      </div>
      <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 18 }}>
        One career. No restarts. Your legacy is permanent.
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {SECTIONS.map((s) => (
          <div key={s.label} className="card" style={{ padding: "12px 14px" }}>
            <div className="lbl" style={{ marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 13, lineHeight: 1.55, color: "var(--ink)" }}>{s.body}</div>
          </div>
        ))}
      </div>

      <button className="btn primary" style={{ width: "100%", marginTop: 18 }} onClick={onBack}>
        {isFirst ? "Got it — start my career →" : "Back to game"}
      </button>
    </div>
  );
}
