import type { RefObject } from "react";
import type { Season } from "@/lib/types";

export default function Timeline({
  history,
  scrollRef,
  position,
}: {
  history: Season[];
  scrollRef: RefObject<HTMLDivElement | null>;
  position: string;
}) {
  if (history.length < 2) return null;
  return (
    <div ref={scrollRef} className="scrollbox card" style={{ marginTop: 12, maxHeight: 96, padding: "6px 12px" }}>
      {history.slice(0, -1).map((s, i) => (
        <div
          key={i}
          style={{
            display: "flex", justifyContent: "space-between", fontSize: 11.5, padding: "4px 0",
            borderBottom: i < history.length - 2 ? "1px solid var(--line)" : "none",
            color: "var(--muted)",
          }}
        >
          <span><b style={{ color: "var(--ink)" }}>{s.season}</b> · {s.club}</span>
          <span>
            {position === "GK" ? `${s.clean}CS` : `${s.goals}G ${s.assists}A`} · {s.ovr}
            {s.trophies.length ? " 🏆" : ""}
            {s.ballon ? " 👑" : ""}
            {s.tourney && s.tourney.result === "Winner" ? (s.tourney.isWC ? " 🌍" : " 🏅") : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
