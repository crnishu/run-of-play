import { legacy, careerScore } from "@/lib/decisions";
import { cardTier } from "@/lib/helpers";
import Spark from "./ui/Spark";
import Flag from "./ui/Flag";
import { useState } from "react";
import type { Player, Career, Season } from "@/lib/types";

export default function CareerCard({
  player,
  career,
  history,
  onRestart,
  onShare,
  onSaveCareer,
  saveCareerStatus = "idle",
  restartLabel = "Start a new career ↻",
}: {
  player: Player;
  career: Career;
  history: Season[];
  onRestart: () => void;
  onShare?: () => void;
  onSaveCareer?: () => void;
  saveCareerStatus?: "idle" | "saving" | "saved" | "error";
  restartLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  function handleShare() {
    onShare?.();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const leg = legacy(career);
  const score = careerScore(career);
  const metal = cardTier(leg.tier);
  const isGK = player.position === "GK";
  const total = (player.earnings + player.brandEarnings).toFixed(0);
  const trophyTotal = career.ballonDors + career.worldCups + career.contCups + career.ucls + career.leagueTitles + career.cups;

  const trophies: string[] = [];
  if (career.ballonDors > 0) trophies.push(`🏆 ${career.ballonDors}× Ballon d'Or`);
  if (career.worldCups > 0) trophies.push(`🌍 ${career.worldCups}× World Cup`);
  if (career.contCups > 0) trophies.push(`🏅 ${career.contCups}× Continental`);
  if (career.ucls > 0) trophies.push(`🌟 ${career.ucls}× UCL`);
  if (career.leagueTitles > 0) trophies.push(`🥇 ${career.leagueTitles}× League`);
  if (career.cups > 0) trophies.push(`🏆 ${career.cups}× Cup`);

  return (
    <div className="fade scrollbox" style={{ maxHeight: 660 }}>
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <div className="lbl">Career Complete · {history.length} seasons · came through {player.academy}</div>
      </div>

      <div className="futwrap">
        <div className={`futcard fut--${metal}`}>
          <div className="futcard__bevel" />
          <div className="futcard__inner">
            <div className="futcard__top">
              <div className="futcard__rating">
                <b>{score}</b>
                <em>{player.position}</em>
                <small>Rating</small>
              </div>
              <div style={{ flex: 1, textAlign: "right", lineHeight: 1.35 }}>
                <div style={{ marginBottom: 3 }}><Flag emoji={player.country.flag} size={30} /></div>
                <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: .3 }}>{player.country.name}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, opacity: .82 }}>Peak OVR {career.peakOvr}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, opacity: .82 }}>€{player.peakMarketValue}M peak</div>
              </div>
            </div>

            <div className="futcard__name">{player.name}</div>
            <div className="futcard__sub">Age {history[0].age}–{player.age} · {player.academy}</div>

            <div style={{ textAlign: "center" }}>
              <div className="futcard__tier">{leg.emoji} {leg.tier}</div>
            </div>

            <div className="futcard__hairline" />

            <div className="futcard__stats">
              <div className="futcard__stat"><b>{career.clubApps}</b><span>Apps</span></div>
              {isGK
                ? <div className="futcard__stat"><b>{career.clubClean}</b><span>Clean Sh.</span></div>
                : <div className="futcard__stat"><b>{career.clubGoals}</b><span>Goals</span></div>}
              <div className="futcard__stat"><b>{career.clubAssists}</b><span>Assists</span></div>
              <div className="futcard__stat"><b>{career.caps}</b><span>Caps</span></div>
              <div className="futcard__stat"><b>{career.intlGoals}</b><span>Intl Gls</span></div>
              <div className="futcard__stat"><b>€{total}M</b><span>Earned</span></div>
            </div>

            <div className="futcard__trophies">
              {trophyTotal > 0
                ? trophies.map((t, i) => <span key={i} className="futcard__trophy">{t}</span>)
                : <span className="futcard__trophy">No major silverware</span>}
            </div>
          </div>
        </div>
      </div>

      {history.length > 1 && (
        <div className="card" style={{ marginTop: 12 }}>
          <div className="lbl" style={{ marginBottom: 6 }}>OVR trajectory</div>
          <Spark values={history.map((s) => s.ovr)} />
        </div>
      )}

      {onSaveCareer && (
        <button
          className="chip"
          style={{
            width: "100%",
            marginTop: 12,
            textAlign: "center",
            ...(saveCareerStatus === "saved" ? { borderColor: "var(--lime)" } : {}),
          }}
          onClick={onSaveCareer}
          disabled={saveCareerStatus === "saving" || saveCareerStatus === "saved"}
        >
          <div className="ttl" style={{ fontSize: 15, color: saveCareerStatus === "saved" ? "var(--lime)" : saveCareerStatus === "error" ? "#ff6b6b" : "var(--gold)" }}>
            {saveCareerStatus === "saving" ? "Saving…"
              : saveCareerStatus === "saved" ? "✓ Saved to my careers"
              : saveCareerStatus === "error" ? "Save failed — try again"
              : "💾 Save to my careers"}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            {saveCareerStatus === "saved" ? "Find it in your My Careers menu." : "Add this card to your collection."}
          </div>
        </button>
      )}

      <button className="btn primary" style={{ width: "100%", marginTop: onSaveCareer ? 8 : 14 }} onClick={onRestart}>
        {restartLabel}
      </button>

      {onShare && (
        <button
          className="chip"
          style={{ width: "100%", marginTop: 8, textAlign: "center" }}
          onClick={handleShare}
        >
          <div className="ttl" style={{ fontSize: 15, color: copied ? "var(--lime)" : undefined }}>
            {copied ? "✓ Link copied!" : "🔗 Share this card"}
          </div>
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            {copied ? "Send it to a friend." : "Copy a link anyone can open."}
          </div>
        </button>
      )}

      <div style={{ textAlign: "center", fontSize: 11, color: "var(--muted)", marginTop: 10, paddingBottom: 4 }}>
        Screenshot your card and challenge a friend.
      </div>
    </div>
  );
}
