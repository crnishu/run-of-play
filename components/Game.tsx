"use client";

import { useState, useEffect, useRef } from "react";
import { COUNTRIES, POSITIONS, TIER_LABEL } from "@/lib/clubs";
import { clubGlow, clubTint, hexToRgba, ovrColor, roleLabel, roleColor, roleFor, clamp } from "@/lib/helpers";
import { newPlayer, simulateSeason } from "@/lib/simulation";
import { clubInterest, offersForPlaytime, buildOffer } from "@/lib/market";
import { buildDecision, brandEvent } from "@/lib/decisions";
import { seasonHeadline, TOURN_RESULT } from "@/lib/narrative";
import { CLUBS } from "@/lib/clubs";
import { pick, chance, rnd } from "@/lib/helpers";
import Header from "./Header";
import Timeline from "./Timeline";
import CareerCard from "./CareerCard";
import HowToPlay from "./HowToPlay";
import Stat from "./ui/Stat";
import Tag from "./ui/Tag";
import type { Player, Career, Season, Offer, Decision, Renewal, Country, Position } from "@/lib/types";

function freshCareer(): Career {
  return { clubApps: 0, clubGoals: 0, clubAssists: 0, clubClean: 0, caps: 0, intlGoals: 0, leagueTitles: 0, cups: 0, ucls: 0, ballonDors: 0, worldCups: 0, contCups: 0, peakOvr: 0 };
}

function applyToCareer(c: Career, s: Season): Career {
  return {
    clubApps: c.clubApps + s.apps,
    clubGoals: c.clubGoals + s.goals,
    clubAssists: c.clubAssists + s.assists,
    clubClean: c.clubClean + s.clean,
    caps: c.caps + s.caps,
    intlGoals: c.intlGoals + s.intlGoals,
    leagueTitles: c.leagueTitles + s.trophies.filter((t) => t === "League Title").length,
    cups: c.cups + s.trophies.filter((t) => t === "Domestic Cup").length,
    ucls: c.ucls + s.trophies.filter((t) => t === "Champions League").length,
    ballonDors: c.ballonDors + (s.ballon ? 1 : 0),
    worldCups: c.worldCups + (s.tourney && s.tourney.isWC && s.tourney.result === "Winner" ? 1 : 0),
    contCups: c.contCups + (s.tourney && !s.tourney.isWC && s.tourney.result === "Winner" ? 1 : 0),
    peakOvr: Math.max(c.peakOvr, s.ovr),
  };
}

function shouldRetire(p: Player): boolean {
  if (p.age >= 37) return true;
  if (p.age >= 35 && chance(0.4)) return true;
  if (p.age >= 34 && p.ovr < 74 && chance(0.5)) return true;
  if (p.age >= 31 && p.ovr < 64) return true;
  if (p.age >= 29 && p.ovr < 68 && p.lastRole === "bench" && chance(0.35)) return true;
  return false;
}

export default function Game() {
  const [phase, setPhase] = useState<string>("howto");
  const [prevPhase, setPrevPhase] = useState<string>("setup");
  const [name, setName] = useState("");
  const [country, setCountry] = useState<Country>(COUNTRIES[0]);
  const [position, setPosition] = useState<Position>(POSITIONS[0]);
  const [player, setPlayer] = useState<Player | null>(null);
  const [history, setHistory] = useState<Season[]>([]);
  const [lastSeason, setLastSeason] = useState<Season | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [renewal, setRenewal] = useState<Renewal | null>(null);
  const [reason, setReason] = useState("");
  const [decision, setDecision] = useState<Decision | null>(null);
  const [recentEv, setRecentEv] = useState<string[]>([]);
  const [career, setCareer] = useState<Career | null>(null);
  const [spinning, setSpinning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function runSeason(p: Player, c: Career, hist: Season[]) {
    setSpinning(true);
    setTimeout(() => {
      const pc = { ...p };
      const s = simulateSeason(pc);
      setPlayer(pc);
      setCareer(applyToCareer(c, s));
      setHistory([...hist, s]);
      setLastSeason(s);
      setSpinning(false);
      setPhase("season");
    }, 600);
  }

  function openHowTo() {
    setPrevPhase(phase);
    setPhase("howto");
  }

  function start() {
    const p = newPlayer(name.trim() || "You", country, position.code);
    const c = freshCareer();
    setPlayer(p); setHistory([]); setCareer(c); setRecentEv([]);
    setPhase("season");
    runSeason(p, c, []);
  }

  function advance() {
    if (!player || !career) return;
    const p = { ...player };
    if (shouldRetire(p)) { setPhase("end"); return; }
    p.age += 1; p.year += 1;
    if (p.youthYears > 0) { setPlayer(p); runSeason(p, career, history); return; }
    if (p.lastRole === "youth") {
      setPlayer(p);
      if (roleFor(p.ovr, p.clubTier) !== "starter" && p.clubTier <= 2) return openMarket(p, "graduation");
      runSeason(p, career, history); return;
    }
    p.contractYears -= 1; setPlayer(p);
    if (p.wantAway) { p.wantAway = false; setPlayer(p); return openMarket(p, "interest"); }
    const benched = p.lastRole === "bench";
    if (p.contractYears <= 0) return openMarket(p, "expiring");
    const brandOdds = clamp(0.06 + (p.reputation / 100) * 0.25 + (p.marketValue / 200) * 0.2, 0.06, 0.42);
    if (!benched && chance(brandOdds)) { setDecision(brandEvent(p)); setPhase("decision"); return; }
    if (p.ovr >= 84 && chance(0.3)) return openMarket(p, "interest");
    if (benched && chance(0.6)) return openMarket(p, "club_loan");
    if (p.ovr >= 82 && p.clubTier >= 3 && chance(0.25)) return openMarket(p, "club_sale");
    if (chance(0.45)) { setDecision(buildDecision(p, recentEv)); setPhase("decision"); return; }
    runSeason(p, career, history);
  }

  function requestTransfer() {
    if (!player || !career) return;
    const p = { ...player };
    if (p.youthYears > 0) return;
    if (shouldRetire(p)) { setPhase("end"); return; }
    p.age += 1; p.year += 1; p.contractYears -= 1;
    p.reputation = clamp(p.reputation - 3, 0, 100);
    setPlayer(p);
    openMarket(p, "request");
  }

  function openMarket(p: Player, why: string) {
    let ext: Offer[] = [], ren: Renewal | null = null;
    if (why === "expiring") {
      ext = clubInterest(p);
      const happy = p.lastRole !== "bench" || p.age <= 23;
      if (happy) ren = { years: rnd(2, 4), wage: +(p.wage * (1 + Math.random() * 0.25 + (p.ovr >= 80 ? 0.2 : 0))).toFixed(1) };
      if (!ren && ext.length === 0) ext = offersForPlaytime(p, 1);
    } else if (why === "interest") {
      ext = clubInterest(p);
    } else if (why === "club_loan" || why === "graduation") {
      ext = offersForPlaytime(p, 2, why === "club_loan");
    } else if (why === "club_sale") {
      ext = clubInterest(p);
      if (!ext.length) ext = [buildOffer(p, pick(CLUBS[2]), 2)];
    } else if (why === "request") {
      ext = clubInterest(p);
      if (roleFor(p.ovr, p.clubTier) !== "bench" && ext.length === 0) ext = offersForPlaytime(p, 1);
    }
    setReason(why); setOffers(ext); setRenewal(ren); setPlayer(p); setPhase("market");
  }

  function chooseMarket(kind: string, offer?: Offer) {
    if (!player || !career) return;
    const p = { ...player };
    if (kind === "offer" && offer) {
      p.club = offer.name; p.clubTier = offer.tier;
      p.league = offer.loan ? offer.league + " (loan)" : offer.league;
      p.wage = offer.wage; p.contractYears = rnd(2, 4); p.seasonsAtClub = 0;
    } else if (kind === "renew" && renewal) {
      p.wage = renewal.wage; p.contractYears = renewal.years;
    } else if (kind === "retire") {
      setPlayer(p); setPhase("end"); return;
    }
    setPlayer(p);
    runSeason(p, career, history);
  }

  function chooseDecision(opt: Decision["a"]) {
    if (!player || !career) return;
    const p = { ...player };
    opt.apply(p);
    setRecentEv([decision!.title, ...recentEv].slice(0, 3));
    setPlayer(p);
    runSeason(p, career, history);
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [history.length]);

  const curClub = player ? player.club : country.club;
  const bgStyle = {
    backgroundImage: `radial-gradient(120% 80% at 50% -12%, ${clubTint(curClub)} 0%, transparent 55%), repeating-linear-gradient(90deg,#0a1410 0,#0a1410 38px,#0b1712 38px,#0b1712 76px)`,
    backgroundColor: "#0a1410",
    transition: "background-image .5s ease",
  };

  return (
    <div className="scuk" style={bgStyle}>
      {phase !== "howto" && (
        <button
          onClick={openHowTo}
          style={{
            position: "absolute", top: 12, right: 12, zIndex: 10,
            background: "var(--panel2)", border: "1px solid var(--line)",
            color: "var(--muted)", borderRadius: 8, padding: "4px 10px",
            cursor: "pointer", fontSize: 12, fontWeight: 700,
            fontFamily: "var(--font-hanken), sans-serif", lineHeight: 1.4,
          }}
        >
          ? How to play
        </button>
      )}

      {phase === "howto" && (
        <HowToPlay
          isFirst={prevPhase === "setup" && !player}
          onBack={() => setPhase(prevPhase)}
        />
      )}

      {phase === "setup" && (
        <div className="fade">
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <div className="ttl" style={{ fontSize: 36, color: "var(--lime)" }}>THE RUN</div>
            <div className="ttl" style={{ fontSize: 36 }}>OF PLAY</div>
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2, marginBottom: 16 }}>
            One career. No restarts. Your academy is decided by fate.
          </div>

          <div className="lbl" style={{ marginBottom: 8 }}>Your name</div>
          <input className="nm" placeholder="Enter a name…" value={name} onChange={(e) => setName(e.target.value)} maxLength={18} />

          <div className="lbl" style={{ margin: "16px 0 8px" }}>
            Home nation <span style={{ textTransform: "none", letterSpacing: 0 }}>(★ national-team strength)</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 7 }}>
            {COUNTRIES.map((c) => (
              <button key={c.name} className={"chip" + (country.name === c.name ? " sel" : "")} onClick={() => setCountry(c)} style={{ textAlign: "center", padding: "8px 4px" }}>
                <div style={{ fontSize: 20 }}>{c.flag}</div>
                <div style={{ fontSize: 9.5, marginTop: 2 }}>{c.name}</div>
                <div style={{ fontSize: 8, color: "var(--gold)" }}>{"★".repeat(c.strength)}</div>
              </button>
            ))}
          </div>

          <div className="lbl" style={{ margin: "16px 0 8px" }}>Position</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 7 }}>
            {POSITIONS.map((p) => (
              <button key={p.code} className={"chip" + (position.code === p.code ? " sel" : "")} onClick={() => setPosition(p)}>
                <div className="ttl" style={{ fontSize: 15 }}>{p.label}</div>
                <div style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 2 }}>{p.desc}</div>
              </button>
            ))}
          </div>

          <button className="btn primary" style={{ width: "100%", marginTop: 20 }} onClick={start}>
            Sign your first contract →
          </button>
        </div>
      )}

      {phase === "season" && player && career && (
        <div className="fade">
          <Header player={player} career={career} />
          {spinning ? (
            <div style={{ height: 300, display: "grid", placeItems: "center" }}>
              <div className="ttl pulse" style={{ fontSize: 24, color: "var(--lime)" }}>SIMULATING SEASON…</div>
            </div>
          ) : lastSeason && (
            <>
              <div className="card" style={{ marginTop: 12, borderColor: hexToRgba(clubGlow(player.club), 0.5) }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div className="ttl" style={{ fontSize: 20 }}>
                    {lastSeason.season} <span style={{ color: "var(--muted)", fontSize: 13 }}>· {lastSeason.year}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: roleColor[lastSeason.role] }}>
                    {roleLabel[lastSeason.role]}
                  </span>
                </div>
                <div style={{ fontSize: 14, color: "var(--lime)", margin: "8px 0 12px", fontWeight: 700 }}>
                  {seasonHeadline(lastSeason, player)}
                </div>
                {lastSeason.graduated && (
                  <div style={{ fontSize: 13, fontWeight: 700, color: "var(--gold)", marginBottom: 10 }}>
                    🎓 Graduated to the senior squad (+{lastSeason.gradBoost} OVR)
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6 }}>
                  <Stat label="Apps" value={lastSeason.apps} count />
                  {player.position === "GK"
                    ? <Stat label="Clean Sheets" value={lastSeason.clean} accent="var(--lime)" count />
                    : <Stat label="Goals" value={lastSeason.goals} accent="var(--lime)" count />}
                  <Stat label="Assists" value={lastSeason.assists} count />
                  <Stat label="Avg Rating" value={lastSeason.rating} accent={ovrColor(lastSeason.ovr)} />
                </div>
                {lastSeason.tourney && (
                  <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,204,61,.08)", border: "1px solid var(--line)" }}>
                    <div className="lbl" style={{ marginBottom: 2 }}>
                      {player.country.flag} {lastSeason.tourney.type} {lastSeason.year}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: TOURN_RESULT[lastSeason.tourney.result].color }}>
                      {lastSeason.tourney.result === "Winner" ? "CHAMPIONS! You lifted the trophy." : `Result: ${lastSeason.tourney.result}`}
                      {lastSeason.tourney.goals > 0 ? ` · ${lastSeason.tourney.goals} goals` : ""}
                    </div>
                  </div>
                )}
                {(lastSeason.trophies.length > 0 || lastSeason.ballon || lastSeason.caps > 0) && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 12 }}>
                    {lastSeason.ballon && <Tag gold>🏆 Ballon d&apos;Or</Tag>}
                    {lastSeason.trophies.map((t, i) => (
                      <Tag key={i}>{t === "Champions League" ? "🌟 " : t === "League Title" ? "🏅 " : "🥇 "}{t}</Tag>
                    ))}
                    {lastSeason.caps > 0 && (
                      <Tag>{player.country.flag} {lastSeason.caps} caps{lastSeason.intlGoals ? ` · ${lastSeason.intlGoals}G` : ""}</Tag>
                    )}
                  </div>
                )}
              </div>
              <Timeline history={history} scrollRef={scrollRef} position={player.position} />
              <button className="btn primary" style={{ width: "100%", marginTop: 12 }} onClick={advance}>
                Next season →
              </button>
              {player.youthYears === 0 && (
                <button className="chip" style={{ marginTop: 8, textAlign: "center" }} onClick={requestTransfer}>
                  <span className="ttl" style={{ fontSize: 14 }}>✋ Hand in a transfer request</span>
                  <span style={{ display: "block", fontSize: 10.5, color: "var(--muted)", marginTop: 1 }}>
                    Play well and better clubs bite — struggle and your club may block it
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      )}

      {phase === "decision" && player && career && decision && (
        <div className="fade">
          <Header player={player} career={career} />
          <div className="ttl" style={{ fontSize: 24, marginTop: 14, color: "var(--gold)" }}>{decision.title}</div>
          <div style={{ fontSize: 14, margin: "8px 0 16px", lineHeight: 1.4 }}>{decision.body}</div>
          {(["a", "b"] as const).map((k) => (
            <button key={k} className="chip" style={{ marginBottom: 9 }} onClick={() => chooseDecision(decision[k])}>
              <div className="ttl" style={{ fontSize: 16 }}>{decision[k].label}</div>
              <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>{decision[k].note}</div>
            </button>
          ))}
        </div>
      )}

      {phase === "market" && player && career && (
        <div className="fade">
          <Header player={player} career={career} />
          <div className="ttl" style={{ fontSize: 23, marginTop: 14, color: "var(--lime)" }}>
            {({
              expiring: "CONTRACT EXPIRING",
              interest: "BIG CLUBS CALLING",
              club_loan: "YOUR CLUB WANTS YOU PLAYING",
              club_sale: "YOUR CLUB ACCEPTED A BID",
              graduation: "ACADEMY GRADUATE",
              request: "TRANSFER REQUEST",
            } as Record<string, string>)[reason]}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>
            {reason === "request"
              ? offers.length ? "Request handed in — here's who came in for you." : "Your club blocked the move — no suitable offers arrived."
              : reason === "club_loan" ? "You're not featuring — they've lined up moves to get you minutes."
              : reason === "graduation" ? "You've come through, but you won't get regular minutes here yet."
              : reason === "club_sale" ? "An offer's been accepted. Push to stay, or take the move."
              : `You're ${player.age}, OVR ${player.ovr}, valued at €${player.marketValue}M. Wage €${player.wage}M/yr.`}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 4 }}>
            {renewal && (
              <button className="chip" onClick={() => chooseMarket("renew")} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="ttl" style={{ fontSize: 17 }}>Renew with {player.club}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>{renewal.years}-yr deal · loyalty</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="ttl" style={{ fontSize: 16, color: "var(--lime)" }}>€{renewal.wage}M</div>
                  <div style={{ fontSize: 10, color: "var(--muted)" }}>per year</div>
                </div>
              </button>
            )}
            {offers.map((o, i) => (
              <button key={i} className="chip" onClick={() => chooseMarket("offer", o)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="ttl" style={{ fontSize: 17, color: clubGlow(o.name) }}>{o.name}{o.loan ? " (loan)" : ""}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{o.league} · {TIER_LABEL[o.tier]}</div>
                  <div style={{ fontSize: 11, color: roleColor[o.proj], fontWeight: 700, marginTop: 2 }}>
                    Projected: {roleLabel[o.proj]}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="ttl" style={{ fontSize: 16, color: "var(--lime)" }}>€{o.fee}M{o.loan ? " loan" : " fee"}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>€{o.wage}M/yr</div>
                </div>
              </button>
            ))}
            {(reason === "interest" || reason === "club_loan" || reason === "club_sale" || reason === "graduation" || reason === "request") && (
              <button className="chip" onClick={() => chooseMarket("stay")} style={{ textAlign: "center" }}>
                <div className="ttl" style={{ fontSize: 15 }}>
                  {reason === "club_sale" ? `Push to stay at ${player.club}`
                    : reason === "request" ? `Withdraw request, stay at ${player.club}`
                    : reason === "interest" ? `Reject & stay at ${player.club}`
                    : "Stay & fight for a spot"}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Honor your contract ({player.contractYears}y left)</div>
              </button>
            )}
            {reason === "expiring" && player.age >= 33 && (
              <button className="chip" onClick={() => chooseMarket("retire")} style={{ textAlign: "center" }}>
                <div className="ttl" style={{ fontSize: 15, color: "var(--muted)" }}>Hang up your boots 🥾</div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>Retire on your own terms</div>
              </button>
            )}
          </div>
        </div>
      )}

      {phase === "end" && player && career && (
        <CareerCard
          player={player}
          career={career}
          history={history}
          onRestart={() => { setPhase("setup"); setPrevPhase("setup"); setName(""); }}
        />
      )}
    </div>
  );
}
