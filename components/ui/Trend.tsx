export default function Trend({ now, prev }: { now: number; prev: number }) {
  const d = now - prev;
  if (d > 0) return <span style={{ color: "var(--lime)", fontSize: 13 }}>▲{d}</span>;
  if (d < 0) return <span style={{ color: "#ff7a7a", fontSize: 13 }}>▼{Math.abs(d)}</span>;
  return <span style={{ color: "var(--muted)", fontSize: 13 }}>–</span>;
}
