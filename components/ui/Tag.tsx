export default function Tag({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span style={{
      fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 20,
      background: gold ? "rgba(255,204,61,.14)" : "var(--panel2)",
      border: `1px solid ${gold ? "var(--gold)" : "var(--line)"}`,
      color: gold ? "var(--gold)" : "var(--ink)",
    }}>
      {children}
    </span>
  );
}
