"use client";

import { useState, useEffect, useRef } from "react";
import { CLUBS, COUNTRIES, POSITIONS, TIER_LABEL, EXPECTED } from "@/lib/clubs";
import { clubGlow, clubTint, hexToRgba, ovrColor, roleLabel, roleColor, roleFor, clamp } from "@/lib/helpers";
import { newPlayer, simulateSeason } from "@/lib/simulation";
import { clubInterest, offersForPlaytime, buildOffer, moneyMoveOffers } from "@/lib/market";
import { buildDecision, brandEvent, legacy, careerScore } from "@/lib/decisions";
import { seasonHeadline, TOURN_RESULT } from "@/lib/narrative";
import { pick, chance, rnd } from "@/lib/helpers";
import Header from "./Header";
import Timeline from "./Timeline";
import CareerCard from "./CareerCard";
import HowToPlay from "./HowToPlay";
import SaveBar from "./SaveBar";
import AuthModal from "./AuthModal";
import Logo from "./Logo";
import { useSession } from "next-auth/react";
import Stat from "./ui/Stat";
import Tag from "./ui/Tag";
import Spark from "./ui/Spark";
import Flag from "./ui/Flag";
import type { Player, Career, Season, Offer, Decision, Renewal, Country, Position, ShareData } from "@/lib/types";

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
  if (p.position === "GK") {
    if (p.age >= 42) return true;
    if (p.age >= 40 && chance(0.45)) return true;
    if (p.age >= 38 && p.ovr < 72 && chance(0.5)) return true;
    if (p.age >= 36 && p.ovr < 65) return true;
    if (p.age >= 34 && p.ovr < 62 && p.lastRole === "bench" && chance(0.3)) return true;
    return false;
  }
  if (p.position === "DEF") {
    if (p.age >= 38) return true;
    if (p.age >= 36 && chance(0.4)) return true;
    if (p.age >= 35 && p.ovr < 74 && chance(0.5)) return true;
    if (p.age >= 32 && p.ovr < 64) return true;
    if (p.age >= 30 && p.ovr < 68 && p.lastRole === "bench" && chance(0.35)) return true;
    return false;
  }
  // MID and FWD retire the soonest once legs go
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
  const [pendingTierChange, setPendingTierChange] = useState(0);
  const [sharedCareer, setSharedCareer] = useState<ShareData | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showMobileStats, setShowMobileStats] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveCareerStatus, setSaveCareerStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [showAuth, setShowAuth] = useState(false);
  const { data: session } = useSession();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sidebarScrollRef = useRef<HTMLDivElement>(null);

  function encodeCareer(p: Player, c: Career, hist: Season[]): string {
    const data: ShareData = {
      n: p.name, p: p.position, ff: p.country.flag, cn: p.country.name,
      ac: p.academy, ag: p.age, s0: hist[0]?.age ?? 17, sn: hist.length,
      apps: c.clubApps, g: c.clubGoals, a: c.clubAssists, cl: c.clubClean,
      caps: c.caps, ig: c.intlGoals,
      wc: c.worldCups, cc: c.contCups, ucl: c.ucls,
      t: c.leagueTitles, cups: c.cups, bd: c.ballonDors,
      povr: c.peakOvr, pmv: p.peakMarketValue,
      earn: +(p.earnings + p.brandEarnings).toFixed(0),
      ovrs: hist.map((s) => s.ovr),
    };
    // TextEncoder handles emoji flags and other multi-byte characters that btoa rejects
    const json = JSON.stringify(data);
    const bytes = new TextEncoder().encode(json);
    const b64 = btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""));
    return encodeURIComponent(b64);
  }

  function decodeShareParam(param: string): ShareData {
    const b64 = decodeURIComponent(param);
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes));
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const shareParam = new URLSearchParams(window.location.search).get("share");
    if (!shareParam) return;
    try {
      const data = decodeShareParam(shareParam);
      setSharedCareer(data);
      setPhase("shared");
    } catch { /* invalid share link — ignore */ }
  }, []);

  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 880);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  function runSeason(p: Player, c: Career, hist: Season[]) {
    setSpinning(true);
    setTimeout(() => {
      const pc = { ...p };
      const s = simulateSeason(pc);
      setPlayer(pc);
      setCareer(applyToCareer(c, s));
      setHistory([...hist, s]);
      setLastSeason(s);
      setPendingTierChange(s.tierChange);
      setSpinning(false);
      setPhase("season");
    }, 600);
  }

  function openHowTo() {
    setPrevPhase(phase);
    setPhase("howto");
  }

  async function saveGame() {
    if (!player || !career) return;
    setSaveStatus("saving");
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport: "soccer",
          data: { player, career, history, phase, pendingTierChange, recentEv },
        }),
      });
      setSaveStatus(res.ok ? "saved" : "error");
    } catch {
      setSaveStatus("error");
    }
    setTimeout(() => setSaveStatus("idle"), 2500);
  }

  async function loadGame() {
    try {
      const res = await fetch("/api/save?sport=soccer");
      if (!res.ok) return;
      const { save } = await res.json();
      if (!save) return;
      setPlayer(save.player);
      setCareer(save.career);
      setHistory(save.history);
      setPhase(save.phase ?? "season");
      setPendingTierChange(save.pendingTierChange ?? 0);
      setRecentEv(save.recentEv ?? []);
      setLastSeason(save.history?.at(-1) ?? null);
    } catch { /* silently ignore load errors */ }
  }

  async function saveCareerToCollection() {
    if (!player || !career) return;
    // Not signed in → prompt to authenticate, then they can save
    if (!session?.user) { setShowAuth(true); return; }

    setSaveCareerStatus("saving");
    const leg = legacy(career);
    const summary = {
      name: player.name,
      flag: player.country.flag,
      country: player.country.name,
      position: player.position,
      academy: player.academy,
      peakOvr: career.peakOvr,
      ageStart: history[0]?.age ?? player.age,
      ageEnd: player.age,
      seasons: history.length,
      score: careerScore(career),
      tier: leg.tier,
      color: leg.color,
      emoji: leg.emoji,
      apps: career.clubApps,
      goals: career.clubGoals,
      assists: career.clubAssists,
      caps: career.caps,
      ballonDors: career.ballonDors,
      worldCups: career.worldCups,
      contCups: career.contCups,
      ucls: career.ucls,
      leagueTitles: career.leagueTitles,
      cups: career.cups,
    };
    try {
      const res = await fetch("/api/careers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport: "soccer",
          name: player.name,
          summary,
          data: { player, career, history },
        }),
      });
      setSaveCareerStatus(res.ok ? "saved" : "error");
    } catch {
      setSaveCareerStatus("error");
    }
  }

  function start() {
    const p = newPlayer(name.trim() || "You", country, position.code);
    const c = freshCareer();
    setPlayer(p); setHistory([]); setCareer(c); setRecentEv([]);
    setLastSeason(null); setPendingTierChange(0); setSharedCareer(null);
    setSaveCareerStatus("idle");
    setPhase("season");
    runSeason(p, c, []);
  }

  function advance() {
    if (!player || !career) return;
    const p = { ...player };
    const onLoan = p.league.includes("(loan)");
    const baseLeague = p.league.replace(" (loan)", "");
    const inMoneyLeague = baseLeague === "Saudi Pro League" || baseLeague === "MLS";

    if (shouldRetire(p)) { setPhase("end"); return; }
    p.age += 1; p.year += 1;
    if (p.youthYears > 0) { setPlayer(p); runSeason(p, career, history); return; }
    if (p.lastRole === "youth") {
      setPlayer(p);
      if (roleFor(p.ovr, p.clubTier) !== "starter" && p.clubTier <= 2) return openMarket(p, "graduation");
      runSeason(p, career, history); return;
    }
    p.contractYears -= 1;

    // Tier change applied after age/contract so the market screen shows the correct stats
    const tc = pendingTierChange;
    setPendingTierChange(0);
    if (tc !== 0 && !onLoan && !inMoneyLeague) {
      p.clubTier = clamp(p.clubTier + tc, 1, 4);
      setPlayer(p);
      if (tc === 1) return openMarket(p, "relegated");
      if (tc === -1 && roleFor(p.ovr, p.clubTier) === "bench") return openMarket(p, "promoted");
      // Promoted and player still starts — fall through
    }
    setPlayer(p);
    const benched = p.lastRole === "bench";

    // Want-away: benchwarmer who has had enough
    if (p.wantAway) { p.wantAway = false; setPlayer(p); return openMarket(p, benched ? "request" : "interest"); }

    if (p.contractYears <= 0) {
      // Loan ended + good performance → loan club wants to sign permanently
      if (onLoan && !benched) return openMarket(p, "loan_permanent");
      return openMarket(p, "expiring");
    }

    const brandOdds = clamp(0.06 + (p.reputation / 100) * 0.25 + (p.marketValue / 200) * 0.2, 0.06, 0.42);
    if (!benched && chance(brandOdds)) { setDecision(brandEvent(p)); setPhase("decision"); return; }

    // Money move: lucrative offer for aging stars not already in a money league
    if (!inMoneyLeague && p.age >= 31 && p.ovr >= 70 && chance(0.22)) return openMarket(p, "money_move");

    // Big clubs come calling for top players (not mid-loan)
    if (!onLoan && p.ovr >= 84 && chance(0.3)) return openMarket(p, "interest");

    // Club offers loan to benched player (not already on loan)
    if (!onLoan && benched && chance(0.6)) return openMarket(p, "club_loan");

    // Club sells player who has significantly outgrown them
    const tierGap = p.ovr - EXPECTED[p.clubTier];
    if (!onLoan && tierGap >= 10 && p.clubTier >= 3 && p.seasonsAtClub >= 2 && chance(0.55))
      return openMarket(p, "club_sale");

    // Mid-tier club cashing in on a high-value asset they can't fully exploit
    if (!onLoan && p.ovr >= 82 && p.clubTier >= 3 && p.seasonsAtClub < 5 && chance(0.25))
      return openMarket(p, "club_sale");

    // Club offloads aging benchwarmer with limited contract remaining
    if (!onLoan && p.age >= 30 && benched && p.contractYears <= 1 && chance(0.55))
      return openMarket(p, "club_sale");

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
    const onLoan = p.league.includes("(loan)");
    const inMoneyLeague = p.league.replace(" (loan)", "") === "Saudi Pro League" || p.league.replace(" (loan)", "") === "MLS";
    const tc = pendingTierChange;
    setPendingTierChange(0);
    if (tc !== 0 && !onLoan && !inMoneyLeague) p.clubTier = clamp(p.clubTier + tc, 1, 4);

    // Elite clubs resist selling starters with years left — block the move and punish rep
    const blockChance = p.clubTier === 1 ? 0.60 : p.clubTier === 2 ? 0.35 : 0;
    if (p.lastRole !== "bench" && p.contractYears >= 2 && chance(blockChance)) {
      p.reputation = clamp(p.reputation - 4, 0, 100);
      setPlayer(p);
      setReason("request");
      setOffers([]);
      setRenewal(null);
      setPhase("market");
      return;
    }

    setPlayer(p);
    openMarket(p, "request");
  }

  function openMarket(p: Player, why: string) {
    let ext: Offer[] = [], ren: Renewal | null = null;
    if (why === "expiring") {
      ext = clubInterest(p);
      // GKs age better so they earn a slightly more generous renewal window
      const gkBonus = p.position === "GK" ? 0.12 : 0;
      let renewChance: number;
      if (p.lastRole === "bench") {
        // Only young talent on the bench stays; older bench players are released
        renewChance = p.age <= 22 ? 0.50 : 0;
      } else {
        renewChance =
          p.age <= 28 ? 1.00 :
          p.age <= 31 ? 0.82 + gkBonus :
          p.age <= 33 ? 0.60 + gkBonus :
          p.age <= 35 ? 0.35 + gkBonus :
                        0.14 + gkBonus;
      }
      if (chance(renewChance)) {
        // Contract length: shorter as career winds down
        const years = p.age <= 27 ? rnd(3, 5) : p.age <= 31 ? rnd(2, 4) : p.age <= 33 ? rnd(1, 3) : rnd(1, 2);
        // Wage: prime players get raises; older players take pay cuts
        const wageMod =
          p.age <= 28 ? 1.15 + Math.random() * 0.30 + (p.ovr >= 80 ? 0.20 : 0) :
          p.age <= 31 ? 1.00 + Math.random() * 0.25 + (p.ovr >= 80 ? 0.15 : 0) :
          p.age <= 33 ? 0.90 + Math.random() * 0.15 :
                        0.72 + Math.random() * 0.14;
        ren = { years, wage: Math.max(0.3, +(p.wage * wageMod).toFixed(1)) };
      }
      if (!ren && ext.length === 0) ext = offersForPlaytime(p, 1);
    } else if (why === "loan_permanent") {
      // Loan club makes a permanent offer; other clubs may also be interested
      const permanentOffer: Offer = {
        name: p.club,
        league: p.league.replace(" (loan)", ""),
        tier: p.clubTier,
        fee: Math.max(1, Math.round(p.marketValue * (0.35 + Math.random() * 0.25))),
        wage: Math.max(0.4, +(p.wage * (1.15 + Math.random() * 0.2)).toFixed(1)),
        loan: false,
        proj: roleFor(p.ovr, p.clubTier),
      };
      ext = [permanentOffer, ...clubInterest(p)];
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
    } else if (why === "relegated" || why === "promoted") {
      ext = clubInterest(p);
      if (ext.length === 0) ext = offersForPlaytime(p, 2);
    } else if (why === "money_move") {
      ext = moneyMoveOffers(p);
    }
    setReason(why); setOffers(ext); setRenewal(ren); setPlayer(p); setPhase("market");
  }

  function chooseMarket(kind: string, offer?: Offer) {
    if (!player || !career) return;
    const p = { ...player };
    if (kind === "offer" && offer) {
      p.club = offer.name; p.clubTier = offer.tier;
      p.league = offer.loan ? offer.league + " (loan)" : offer.league;
      p.wage = offer.wage;
      // Loans are always a single-season arrangement; permanent deals are 2-4 years
      p.contractYears = offer.loan ? 1 : rnd(2, 4);
      p.seasonsAtClub = 0;
      p.consecutiveBench = 0;
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
    if (sidebarScrollRef.current) sidebarScrollRef.current.scrollTop = sidebarScrollRef.current.scrollHeight;
  }, [history.length]);

  const curClub = player ? player.club : country.club;
  const bgStyle = {
    backgroundImage: `radial-gradient(120% 80% at 50% -12%, ${clubTint(curClub)} 0%, transparent 55%), repeating-linear-gradient(90deg,#0a1410 0,#0a1410 38px,#0b1712 38px,#0b1712 76px)`,
    backgroundColor: "#0a1410",
    transition: "background-image .5s ease",
  };

  const showSidebar = isDesktop && !!(player && career && ["season", "market", "decision"].includes(phase));

  return (
    <div style={{ width: "100%", maxWidth: showSidebar ? 880 : 480 }}>
    <SaveBar onSave={saveGame} onLoad={loadGame} onRequestAuth={() => setShowAuth(true)} saveStatus={saveStatus} />
    {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    <div className={showSidebar ? "game-outer" : undefined}>
    <div className="scuk" style={bgStyle}>
      {phase !== "howto" && phase !== "end" && (
        <button
          onClick={openHowTo}
          style={{
            position: "absolute", ...( ["season","market","decision"].includes(phase) ? { bottom: 12 } : { top: 12 }), right: 12, zIndex: 10,
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
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Logo size={46} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <div className="ttl" style={{ fontSize: 36, color: "var(--lime)" }}>RYZE</div>
              <div className="ttl" style={{ fontSize: 36 }}>SPORTS</div>
            </div>
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
                <Flag emoji={c.flag} size={28} />
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="ttl" style={{ fontSize: 20 }}>
                    {lastSeason.season} <span style={{ color: "var(--muted)", fontSize: 13 }}>· Age {lastSeason.age}</span>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: roleColor[lastSeason.role] }}>
                      {roleLabel[lastSeason.role]}
                    </div>
                    {(() => { const d = lastSeason.ovr - lastSeason.prevOvr; return d !== 0 ? (
                      <div style={{ fontSize: 11, fontWeight: 700, color: d > 0 ? "var(--lime)" : "#ff6b6b" }}>
                        {d > 0 ? "+" : ""}{d} OVR
                      </div>
                    ) : null; })()}
                  </div>
                </div>
                {lastSeason.breakout && (
                  <div style={{ fontSize: 11, fontWeight: 700, color: "var(--lime)", marginTop: 6, letterSpacing: 1 }}>
                    ⚡ BREAKOUT SEASON
                  </div>
                )}
                <div style={{ fontSize: 14, color: "var(--lime)", margin: "6px 0 12px", fontWeight: 700 }}>
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
                {lastSeason.injured && (
                  <div style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600, marginTop: 10, display: "flex", alignItems: "center", gap: 4 }}>
                    ⚠️ Season disrupted by injury — appearances reduced
                  </div>
                )}
                {player.contractYears === 1 && !player.league.includes("(loan)") && (
                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 8, padding: "6px 10px", borderRadius: 8, background: "rgba(255,204,61,.08)", border: "1px solid rgba(255,204,61,.25)", color: "var(--gold)" }}>
                    📋 Contract expires after this season
                  </div>
                )}
                {lastSeason.tourney && (
                  <div style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10, background: "rgba(255,204,61,.08)", border: "1px solid var(--line)" }}>
                    <div className="lbl" style={{ marginBottom: 2 }}>
                      <Flag emoji={player.country.flag} size={16} /> {lastSeason.tourney.type} {lastSeason.year}
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
                      <Tag><Flag emoji={player.country.flag} size={16} /> {lastSeason.caps} caps{lastSeason.intlGoals ? ` · ${lastSeason.intlGoals}G` : ""}</Tag>
                    )}
                  </div>
                )}
              </div>
              {!isDesktop && (
                <div style={{ marginTop: 8 }}>
                  <button
                    className="chip"
                    style={{ width: "100%", textAlign: "center", padding: "8px 12px" }}
                    onClick={() => setShowMobileStats((v) => !v)}
                  >
                    <span className="lbl" style={{ letterSpacing: 1.5 }}>
                      {showMobileStats
                        ? "▲ Hide career stats"
                        : `▼ Career · ${career.clubApps} apps · ${player.position === "GK" ? `${career.clubClean} CS` : `${career.clubGoals}G ${career.clubAssists}A`}`}
                    </span>
                  </button>
                  {showMobileStats && (
                    <div className="card fade" style={{ marginTop: 6 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10 }}>
                        <Stat label="Apps" value={career.clubApps} count />
                        {player.position === "GK"
                          ? <Stat label="Clean Sh." value={career.clubClean} accent="var(--lime)" count />
                          : <Stat label="Goals" value={career.clubGoals} accent="var(--lime)" count />}
                        <Stat label="Assists" value={career.clubAssists} count />
                      </div>
                      {history.length > 1 && <Spark values={history.map((s) => s.ovr)} />}
                      {(career.leagueTitles + career.cups + career.ucls + career.ballonDors + career.worldCups + career.contCups) > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
                          {career.ballonDors > 0 && <Tag gold>🏆 {career.ballonDors}×</Tag>}
                          {career.worldCups > 0 && <Tag gold>🌍 {career.worldCups}×</Tag>}
                          {career.contCups > 0 && <Tag gold>🏅 {career.contCups}×</Tag>}
                          {career.ucls > 0 && <Tag>🌟 {career.ucls}×</Tag>}
                          {career.leagueTitles > 0 && <Tag>🏅 {career.leagueTitles}×</Tag>}
                          {career.cups > 0 && <Tag>🥇 {career.cups}×</Tag>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {!isDesktop && (
                <Timeline history={history} scrollRef={scrollRef} position={player.position} />
              )}
              <button className="btn primary" style={{ width: "100%", marginTop: 12 }} onClick={advance}>
                Next season →
              </button>
              {player.youthYears === 0 && (
                <button
                  className="chip"
                  style={{ marginTop: 8, textAlign: "center", ...(lastSeason?.role === "bench" ? { borderColor: "var(--lime)" } : {}) }}
                  onClick={requestTransfer}
                >
                  <span className="ttl" style={{ fontSize: 14, color: lastSeason?.role === "bench" ? "var(--lime)" : undefined }}>
                    {lastSeason?.role === "bench" ? "🚪 Request a transfer — you're wasting away here" : "✋ Hand in a transfer request"}
                  </span>
                  <span style={{ display: "block", fontSize: 10.5, color: "var(--muted)", marginTop: 1 }}>
                    {lastSeason?.role === "bench" ? "Get playing time elsewhere before it's too late" : "Play well and better clubs bite — struggle and your club may block it"}
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
          <div className="ttl" style={{ fontSize: 23, marginTop: 14, color: reason === "money_move" ? "var(--gold)" : "var(--lime)" }}>
            {({
              expiring: "CONTRACT EXPIRING",
              interest: "BIG CLUBS CALLING",
              club_loan: "YOUR CLUB WANTS YOU PLAYING",
              club_sale: "YOUR CLUB ACCEPTED A BID",
              graduation: "ACADEMY GRADUATE",
              request: "TRANSFER REQUEST",
              relegated: "CLUB RELEGATED",
              promoted: "PROMOTED — BUT WILL YOU FIT?",
              money_move: "THE MONEY CALL",
              loan_permanent: "LOAN CLUB WANTS YOU PERMANENTLY",
            } as Record<string, string>)[reason]}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>
            {reason === "request"
              ? offers.length ? "Request handed in — here's who came in for you." : "Your club blocked the move — no suitable offers arrived."
              : reason === "club_loan" ? "You're not featuring — they've lined up moves to get you minutes."
              : reason === "graduation" ? "You've come through, but you won't get regular minutes here yet."
              : reason === "club_sale" ? "An offer's been accepted. Push to stay, or take the move."
              : reason === "relegated" ? `${player.club} were relegated. Fight for promotion or find a new club.`
              : reason === "promoted" ? `${player.club} got promoted — but the higher tier may leave you on the bench.`
              : reason === "money_move" ? "A big-money league is calling. Life-changing wages, different football."
              : reason === "loan_permanent" ? `Your loan is up and ${player.club} want to keep you — or move on.`
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
            {offers.length === 0 && !renewal && (
              <div style={{ textAlign: "center", padding: "12px 0 4px", color: "var(--muted)", fontSize: 13 }}>
                No clubs came in. The market is quiet.
              </div>
            )}
            {(reason === "interest" || reason === "club_loan" || reason === "club_sale" || reason === "graduation" || reason === "request" || reason === "relegated" || reason === "promoted" || reason === "money_move") && (
              <button className="chip" onClick={() => chooseMarket("stay")} style={{ textAlign: "center" }}>
                <div className="ttl" style={{ fontSize: 15 }}>
                  {reason === "club_sale" ? `Push to stay at ${player.club}`
                    : reason === "request" ? `Withdraw request, stay at ${player.club}`
                    : reason === "interest" ? `Reject & stay at ${player.club}`
                    : reason === "relegated" ? `Stay & fight for promotion`
                    : reason === "promoted" ? `Stay & compete for your place`
                    : reason === "money_move" ? `Decline — football over fortune`
                    : "Stay & fight for a spot"}
                </div>
                <div style={{ fontSize: 11, color: "var(--muted)" }}>
                  {reason === "money_move" ? "Stay focused on top-level football." : `Honor your contract (${player.contractYears}y left)`}
                </div>
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
          onSaveCareer={saveCareerToCollection}
          saveCareerStatus={saveCareerStatus}
          onRestart={() => { setPhase("setup"); setPrevPhase("setup"); setName(""); }}
          onShare={() => {
            const encoded = encodeCareer(player, career, history);
            const url = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
            navigator.clipboard.writeText(url).catch(() => { prompt("Copy your career link:", url); });
          }}
        />
      )}

      {phase === "shared" && sharedCareer && (() => {
        const sd = sharedCareer;
        const reconstructedCareer: Career = {
          clubApps: sd.apps, clubGoals: sd.g, clubAssists: sd.a, clubClean: sd.cl,
          caps: sd.caps, intlGoals: sd.ig, leagueTitles: sd.t, cups: sd.cups,
          ucls: sd.ucl, ballonDors: sd.bd, worldCups: sd.wc, contCups: sd.cc, peakOvr: sd.povr,
        };
        const reconstructedPlayer: Player = {
          name: sd.n, position: sd.p, age: sd.ag, year: 0,
          country: { name: sd.cn, flag: sd.ff, club: "", strength: 0, cup: "" },
          academy: sd.ac, ovr: sd.povr, prevOvr: sd.povr, potential: sd.povr, peakOvr: sd.povr,
          consistency: 1, devBonus: 0, club: "", clubTier: 1, league: "",
          reputation: 0, wage: 0, earnings: sd.earn, brandEarnings: 0,
          mvMod: 0, marketValue: 0, peakMarketValue: sd.pmv,
          contractYears: 0, seasonsAtClub: 0, youthYears: 0,
          injuryRisk: 0, forceRest: false, retiredFromIntl: false, wantAway: false,
          lastApps: 0, lastRole: "starter", consecutiveBench: 0,
          peakAge: 30, declineAge: 35, fastDeclineAge: 39,
        };
        const reconstructedHistory: Season[] = sd.ovrs.map((ovr, i) => ({
          season: `${2026 + i}/${String(2027 + i).slice(2)}`, year: 2026 + i, age: sd.s0 + i, club: "",
          ovr, prevOvr: i > 0 ? sd.ovrs[i - 1] : ovr,
          apps: 0, goals: 0, assists: 0, clean: 0, rating: 7,
          trophies: [], ballon: false, caps: 0, intlGoals: 0,
          injured: false, breakout: false, role: "starter",
          tourney: null, graduated: false, gradBoost: 0, mv: 0, tierChange: 0,
        }));
        return (
          <div className="fade">
            <div style={{ textAlign: "center", marginBottom: 6, fontSize: 11, color: "var(--muted)" }}>
              👁 Viewing a shared career — <span style={{ color: "var(--lime)" }}>start your own below</span>
            </div>
            <CareerCard
              player={reconstructedPlayer}
              career={reconstructedCareer}
              history={reconstructedHistory}
              onRestart={() => {
                setSharedCareer(null);
                if (typeof window !== "undefined") window.history.replaceState({}, "", window.location.pathname);
                setPhase("setup"); setPrevPhase("setup"); setName("");
              }}
            />
          </div>
        );
      })()}
    </div>

    {showSidebar && player && career && (
      <div className="game-sidebar">
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="ttl" style={{ fontSize: 17, lineHeight: 1.2 }}>
                <Flag emoji={player.country.flag} size={20} /> {player.name}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--muted)", marginTop: 3 }}>
                {player.position} · Age {player.age} · <span style={{ color: ovrColor(player.ovr) }}>OVR {player.ovr}</span>
              </div>
              <div style={{ fontSize: 11.5, marginTop: 1 }}>
                {player.club} <span style={{ color: "var(--muted)" }}>· {player.league.replace(" (loan)", " (loan)")}</span>
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
              <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1 }}>Contract</div>
              <div className="ttl" style={{ fontSize: 22, color: player.contractYears <= 1 ? "var(--gold)" : "var(--lime)" }}>
                {player.contractYears}y
              </div>
            </div>
          </div>

          <div className="lbl" style={{ margin: "12px 0 6px" }}>Career totals</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            <Stat label="Apps" value={career.clubApps} count />
            {player.position === "GK"
              ? <Stat label="Clean Sh." value={career.clubClean} accent="var(--lime)" count />
              : <Stat label="Goals" value={career.clubGoals} accent="var(--lime)" count />}
            <Stat label="Assists" value={career.clubAssists} count />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginTop: 6 }}>
            <Stat label="Caps" value={career.caps} count />
            <Stat label="€/yr" value={`€${player.wage}M`} />
          </div>

          {history.length > 1 && (
            <>
              <div className="lbl" style={{ margin: "12px 0 4px" }}>OVR trajectory</div>
              <Spark values={history.map((s) => s.ovr)} />
            </>
          )}

          {(career.leagueTitles + career.cups + career.ucls + career.ballonDors + career.worldCups + career.contCups) > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 10 }}>
              {career.ballonDors > 0 && <Tag gold>🏆 {career.ballonDors}×</Tag>}
              {career.worldCups > 0 && <Tag gold>🌍 {career.worldCups}×</Tag>}
              {career.contCups > 0 && <Tag gold>🏅 {career.contCups}×</Tag>}
              {career.ucls > 0 && <Tag>🌟 {career.ucls}×</Tag>}
              {career.leagueTitles > 0 && <Tag>🏅 {career.leagueTitles}×</Tag>}
              {career.cups > 0 && <Tag>🥇 {career.cups}×</Tag>}
            </div>
          )}
        </div>

        {history.length >= 2 && (
          <>
            <div className="lbl" style={{ marginBottom: 6, paddingLeft: 2 }}>Season log</div>
            <Timeline history={history} scrollRef={sidebarScrollRef} position={player.position} maxH={340} />
          </>
        )}
      </div>
    )}
    </div>
    </div>
  );
}
