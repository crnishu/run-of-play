import { hexToRgba, clubGlow, ovrColor } from "@/lib/helpers";
import Stat from "./ui/Stat";
import Trend from "./ui/Trend";
import type { Player, Career } from "@/lib/types";

export default function Header({ player, career }: { player: Player; career: Career }) {
  const inYouth = player.youthYears > 0;
  return (
    <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 15px", borderColor: hexToRgba(clubGlow(player.club), 0.6) }}>
      <div>
        <div className="ttl" style={{ fontSize: 18 }}>{player.country.flag} {player.name}</div>
        <div style={{ fontSize: 11.5, color: "var(--muted)" }}>
          {player.position} · <span style={{ color: clubGlow(player.club) }}>{player.club}</span>
        </div>
        <div style={{ fontSize: 10.5, color: "var(--gold)", marginTop: 2 }}>
          {inYouth ? "📘 Academy" : `📄 ${player.contractYears}y deal`} · 💰 €{player.wage}M/yr wage · 📈 €{player.marketValue}M value
        </div>
      </div>
      <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
        <Stat label="Age" value={player.age} />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: "var(--font-anton), sans-serif", fontSize: 28, lineHeight: 1, color: ovrColor(player.ovr) }}>
            {player.ovr}
          </div>
          <div style={{ fontSize: 9.5, letterSpacing: 1.3, color: "var(--muted)", marginTop: 4 }}>
            OVR <Trend now={player.ovr} prev={player.prevOvr} />
          </div>
        </div>
        <Stat label="🏆" value={career.leagueTitles + career.cups + career.ucls + career.worldCups + career.contCups} accent="var(--gold)" />
      </div>
    </div>
  );
}
