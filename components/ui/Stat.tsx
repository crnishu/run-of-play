import CountUp from "./CountUp";

export default function Stat({
  label,
  value,
  accent,
  count,
}: {
  label: string;
  value: number | string;
  accent?: string;
  count?: boolean;
}) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: 26, lineHeight: 1, color: accent || "var(--ink)" }}>
        {count && typeof value === "number" ? <CountUp value={value} /> : value}
      </div>
      <div style={{ fontSize: 9.5, letterSpacing: 1.3, textTransform: "uppercase", color: "var(--muted)", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}
