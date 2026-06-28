import { CLUBS, CLUB_TIER, CLUB_LEAGUE, ACADEMY_CLUBS } from "./clubs";
import { rnd, pick, chance, clamp, roleFor } from "./helpers";
import type { Player, Season, Country } from "./types";

export function rollPotential(): number {
  const r = Math.random();
  return r < 0.55 ? rnd(70, 79) : r < 0.85 ? rnd(79, 86) : r < 0.97 ? rnd(86, 90) : rnd(90, 95);
}

export function rollAcademy(country: Country) {
  if (chance(0.6)) {
    return { club: country.club, tier: CLUB_TIER[country.club] || 4, dev: 0, league: CLUB_LEAGUE[country.club] || "Home League" };
  }
  const [club, dev] = pick(ACADEMY_CLUBS);
  return { club, tier: CLUB_TIER[club], dev, league: CLUB_LEAGUE[club] };
}

export function updateMV(p: Player, rating?: number): void {
  const base = Math.pow(Math.max(0, (p.ovr - 52) / 10), 2.4) * 3.0;
  // GKs retain value longer; FWDs peak earlier
  const gkMod = p.position === "GK" ? 1.1 : p.position === "DEF" ? 1.05 : 1.0;
  const ageMult =
    p.age <= 21 ? 1.35 : p.age <= 25 ? 1.2 : p.age <= 28 ? 1.0 : p.age <= 31 ? 0.62 : p.age <= 33 ? 0.38 : 0.18;
  let mv = base * ageMult * gkMod * (1 + p.mvMod);
  if (rating !== undefined) mv *= clamp(0.9 + (rating - 6.7) / 6, 0.8, 1.2);
  p.marketValue = Math.max(0.2, +mv.toFixed(1));
  p.peakMarketValue = Math.max(p.peakMarketValue || 0, p.marketValue);
}

export function newPlayer(name: string, country: Country, position: string): Player {
  const academy = rollAcademy(country);
  const potential = rollPotential();
  const startOvr = clamp(potential - rnd(15, 21), 52, 65);
  const ageProfile = rollAgeProfile(position);
  const p: Player = {
    name, country, position, age: 17, year: 2026,
    ovr: startOvr, prevOvr: startOvr, potential, peakOvr: startOvr,
    consistency: +(0.78 + Math.random() * 0.27).toFixed(2), devBonus: academy.dev, academy: academy.club,
    club: academy.club, clubTier: academy.tier, league: academy.league,
    reputation: 8, wage: academy.tier <= 2 ? +(rnd(5, 12) / 10).toFixed(1) : +(rnd(2, 6) / 10).toFixed(1),
    earnings: 0, brandEarnings: 0, mvMod: 0, marketValue: 1, peakMarketValue: 1,
    contractYears: rnd(2, 3), seasonsAtClub: 0, youthYears: 2,
    injuryRisk: 0, forceRest: false, retiredFromIntl: false, wantAway: false,
    lastApps: 28, lastRole: "youth", consecutiveBench: 0,
    ...ageProfile,
  };
  updateMV(p);
  return p;
}

function tournamentResult(strength: number, ovr: number, isWC: boolean): string {
  const score = strength * 1.4 + (ovr - 75) / 8 + Math.random() * 2.2 + (isWC ? 0 : 0.4);
  if (score >= (isWC ? 8.4 : 7.8)) return "Winner";
  if (score >= (isWC ? 7.2 : 6.6)) return "Final";
  if (score >= 5.6) return "Semi-final";
  if (score >= 4.6) return "Quarter-final";
  return "Group stage";
}

// Each player gets a slightly different curve rolled at birth — no two careers age identically
export function rollAgeProfile(position: string): { peakAge: number; declineAge: number; fastDeclineAge: number } {
  // mk(peakMin, peakMax, minGapToDecline, minGapToFastDecline)
  const mk = (peakMin: number, peakMax: number, decMin: number, decMax: number, fastMin: number, fastMax: number) => {
    const peakAge = rnd(peakMin, peakMax);
    const declineAge = peakAge + rnd(decMin, decMax);
    const fastDeclineAge = declineAge + rnd(fastMin, fastMax);
    return { peakAge, declineAge, fastDeclineAge };
  };
  switch (position) {
    case "GK":  return mk(30, 34, 2, 4, 3, 5); // peaks 30–34, declines 2–4 yrs later, fast decline 3–5 after that
    case "DEF": return mk(27, 31, 2, 4, 2, 4);
    case "MID": return mk(27, 31, 2, 4, 2, 4);
    default:    return mk(25, 29, 2, 4, 2, 4); // FWD
  }
}

export function simulateSeason(p: Player): Season {
  p.prevOvr = p.ovr;
  const youth = p.youthYears > 0;
  const role = youth ? "youth" : roleFor(p.ovr, p.clubTier);

  // Track consecutive bench seasons (never during youth)
  if (!youth) {
    p.consecutiveBench = role === "bench" ? (p.consecutiveBench || 0) + 1 : 0;
  }

  // Flop: young talent rotting on the bench erodes their ceiling
  if (!youth && p.age <= 22 && (p.consecutiveBench || 0) >= 2 && p.potential > 75) {
    p.potential = clamp(p.potential - rnd(1, 2), 70, 96);
  }

  let apps = youth ? rnd(24, 34) : role === "starter" ? rnd(30, 38) : role === "rotation" ? rnd(18, 28) : rnd(5, 15);
  let injured = false;
  if (chance(0.12 + p.injuryRisk)) { injured = true; apps = Math.max(3, Math.round(apps * rnd(35, 65) / 100)); }
  if (p.forceRest) { apps = Math.max(4, Math.round(apps * 0.5)); p.forceRest = false; }
  p.injuryRisk = Math.max(0, p.injuryRisk - 0.1);

  let gradBoost = 0, graduated = false;
  if (youth) {
    p.youthYears -= 1;
    if (p.youthYears === 0) {
      gradBoost = Math.round((p.potential - p.ovr) * (0.25 + p.devBonus)) + rnd(1, 3);
      graduated = true;
    }
  }

  const { peakAge, declineAge, fastDeclineAge } = p;
  let breakout = false;

  if (p.age <= peakAge) {
    const gap = p.potential - p.ovr, minutes = apps / 38;
    let growth = Math.round(gap * (0.10 + Math.random() * 0.16) * minutes * p.consistency * (1 + p.devBonus));
    if (role === "bench") growth = Math.max(0, growth - 1);
    if (role !== "bench" && chance(0.07)) { growth += rnd(2, 4); breakout = true; }
    p.ovr = clamp(p.ovr + Math.max(0, growth) + gradBoost, 50, p.potential);
  } else if (p.age >= declineAge) {
    const declineAmt = p.age >= fastDeclineAge ? rnd(2, 4) : p.age >= declineAge + 2 ? rnd(1, 3) : rnd(0, 2);
    p.ovr = clamp(p.ovr - declineAmt, 40, 99);
  } else {
    // Prime plateau — small noise, no net growth or decline
    p.ovr = clamp(p.ovr + rnd(-1, 1), 50, p.potential);
  }
  p.peakOvr = Math.max(p.peakOvr, p.ovr);

  // Tier-adjusted stat multipliers: lower tier = inflated numbers, harder to clean sheet in top flight
  const tierGoalMult = ([0, 0.88, 0.96, 1.06, 1.18] as number[])[p.clubTier] ?? 1.0;
  const tierCsMult   = ([0, 0.82, 0.92, 1.06, 1.22] as number[])[p.clubTier] ?? 1.0;

  const q = (p.ovr - 55) / 40, m = apps / 34;
  let goals = 0, assists = 0, clean = 0;
  if (p.position === "FWD") {
    goals   = Math.round(apps * (0.22 + q * 0.65) * (0.8 + Math.random() * 0.5) * tierGoalMult);
    assists = Math.round(apps * (0.08 + q * 0.22) * (0.7 + Math.random() * 0.6) * tierGoalMult);
  } else if (p.position === "MID") {
    goals   = Math.round(apps * (0.08 + q * 0.28) * (0.7 + Math.random() * 0.6) * tierGoalMult);
    assists = Math.round(apps * (0.16 + q * 0.38) * (0.7 + Math.random() * 0.6) * tierGoalMult);
  } else if (p.position === "DEF") {
    goals   = Math.round(apps * (0.02 + q * 0.07) * Math.random() * tierGoalMult);
    assists = Math.round(apps * (0.04 + q * 0.1) * Math.random() * tierGoalMult);
    clean   = Math.round(apps * (0.18 + q * 0.28) * m * tierCsMult);
  } else {
    clean = Math.round(apps * (0.22 + q * 0.33) * m * tierCsMult);
  }
  const rating = +clamp(6.0 + q * 2.4 + (Math.random() - 0.4) + (role === "bench" ? -0.6 : 0), 5.4, 9.4).toFixed(2);

  const trophies: string[] = [];
  if (!youth && role !== "bench") {
    const odds = ({ 1: { l: 0.35, c: 0.26, u: 0.15 }, 2: { l: 0.12, c: 0.13, u: 0.06 }, 3: { l: 0.03, c: 0.06, u: 0.01 }, 4: { l: 0.05, c: 0.03, u: 0 } } as Record<number, { l: number; c: number; u: number }>)[p.clubTier];
    // Form matters: a great personal season slightly shifts the club's odds
    const formBoost = clamp((rating - 6.5) / 20, -0.04, 0.06);
    if (chance(odds.l + formBoost)) trophies.push("League Title");
    if (chance(odds.c + formBoost)) trophies.push("Domestic Cup");
    if (chance(odds.u + formBoost)) trophies.push("Champions League");
  }
  let ballon = false;
  const big = (goals + assists) >= 28 || (p.position === "GK" && clean >= 18) || (p.position === "DEF" && clean >= 20);
  if (!youth && p.ovr >= 90 && p.clubTier === 1 && big && chance(0.3)) ballon = true;

  let caps = 0, intlGoals = 0, tourney = null;
  const eligible = !youth && p.ovr >= 73 && !p.retiredFromIntl;
  if (eligible) {
    caps = rnd(4, 9);
    if (p.position === "FWD") intlGoals = Math.round(caps * (0.15 + q * 0.45) * Math.random());
    else if (p.position === "MID") intlGoals = Math.round(caps * 0.18 * Math.random());
    const isWC = p.year % 4 === 2, isCont = p.year % 4 === 0;
    if (isWC || isCont) {
      const result = tournamentResult(p.country.strength, p.ovr, isWC);
      const tg = p.position === "FWD" ? rnd(0, isWC ? 5 : 4) : p.position === "MID" ? rnd(0, 2) : 0;
      caps += rnd(3, 6); intlGoals += tg;
      tourney = { type: isWC ? "World Cup" : p.country.cup, isWC, result, goals: tg };
      if (result === "Winner") p.mvMod += isWC ? 0.1 : 0.05;
    }
  }

  // Tier change: one roll per season so promotion and relegation are mutually exclusive
  let tierChange = 0;
  if (!youth) {
    const roll = Math.random();
    if (p.clubTier === 2) {
      if (roll < 0.03) tierChange = 1;                   // 3% relegated — rare for established big clubs
    } else if (p.clubTier === 3) {
      if (roll < 0.06) tierChange = -1;                  // 6% promoted
      else if (roll < 0.14) tierChange = 1;              // 8% relegated  (0.06–0.14)
    } else if (p.clubTier === 4) {
      if (roll < 0.10) tierChange = -1;                  // 10% promoted
    }
  }

  let repGain = youth
    ? Math.round(q * 4) + 2
    : trophies.length * 6 + (ballon ? 25 : 0) + Math.round(q * 6) + (4 - p.clubTier) - (role === "bench" ? 4 : 0);
  if (tourney && (tourney as { result: string }).result === "Winner") repGain += (tourney as { isWC: boolean }).isWC ? 30 : 16;
  // Loyalty: long-serving players are loved by club and fans
  if (!youth && p.seasonsAtClub >= 4) repGain += 2;
  p.reputation = clamp(p.reputation + repGain, 0, 100);
  p.seasonsAtClub += 1; p.earnings += p.wage; p.lastApps = apps; p.lastRole = role;
  updateMV(p, rating);

  // After 2 consecutive bench seasons the player has had enough and wants out
  if ((p.consecutiveBench || 0) >= 2 && !p.wantAway && chance(0.6)) {
    p.wantAway = true;
  }

  return {
    season: `${p.year}/${String(p.year + 1).slice(2)}`, year: p.year, age: p.age, club: p.club,
    ovr: p.ovr, prevOvr: p.prevOvr, apps, goals, assists, clean, rating,
    trophies, ballon, caps, intlGoals, injured, breakout, role,
    tourney: tourney as Season["tourney"], graduated, gradBoost, mv: p.marketValue,
    tierChange,
  };
}
