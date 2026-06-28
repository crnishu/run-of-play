function codeFromEmoji(emoji: string): string | null {
  const pts = [...emoji].map((c) => c.codePointAt(0)!);
  // Two regional-indicator chars → ISO 3166-1 alpha-2  (e.g. 🇫🇷 → "fr")
  if (pts.length === 2 && pts[0] >= 0x1f1e6 && pts[0] <= 0x1f1ff) {
    const a = String.fromCodePoint(pts[0] - 0x1f1e6 + 65).toLowerCase();
    const b = String.fromCodePoint(pts[1] - 0x1f1e6 + 65).toLowerCase();
    return a + b;
  }
  // Tag-sequence flag starting with 🏴 — only England in this game
  if (pts[0] === 0x1f3f4) return "gb-eng";
  return null;
}

// flagcdn.com only serves a fixed set of widths — anything else 404s (e.g. 30 → broken image)
const FLAG_WIDTHS = [16, 20, 24, 28, 32, 36, 40, 48, 56, 64, 80, 120, 160];
const snapWidth = (s: number) =>
  FLAG_WIDTHS.reduce((best, w) => (Math.abs(w - s) < Math.abs(best - s) ? w : best), FLAG_WIDTHS[0]);

export default function Flag({ emoji, size = 20 }: { emoji: string; size?: number }) {
  const code = codeFromEmoji(emoji);
  if (!code) return <span style={{ fontSize: size * 0.85 }}>{emoji}</span>;
  const w = snapWidth(size);
  const h = Math.round(w * 0.75);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${w}x${h}/${code}.png`}
      width={w}
      height={h}
      alt={emoji}
      style={{ display: "inline-block", verticalAlign: "middle", borderRadius: 2 }}
    />
  );
}
