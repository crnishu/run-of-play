export default function Spark({ values, w = 280, h = 46 }: { values: number[]; w?: number; h?: number }) {
  if (values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values), range = Math.max(1, max - min);
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * (w - 4) + 2,
    h - ((v - min) / range) * (h - 8) - 4,
  ]);
  const line = pts.map((p) => p.join(",")).join(" ");
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <polygon points={`2,${h} ${line} ${w - 2},${h}`} fill="rgba(182,255,61,.12)" />
      <polyline points={line} fill="none" stroke="var(--lime)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map((p, i) =>
        i === pts.length - 1 && <circle key={i} cx={p[0]} cy={p[1]} r="3.2" fill="var(--lime)" />
      )}
    </svg>
  );
}
