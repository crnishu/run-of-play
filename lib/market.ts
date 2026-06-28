import { CLUBS, CLUB_LEAGUE, TIER_LABEL, MONEY_CLUBS } from "./clubs";
import { rnd, pick, roleFor } from "./helpers";
import type { Player, Offer } from "./types";

export function buildOffer(p: Player, c: { name: string; league: string }, tier: number, loan?: boolean): Offer {
  const fee = Math.max(1, Math.round(p.marketValue * (0.8 + (4 - tier) * 0.22 + Math.random() * 0.5)));
  const wage = Math.max(0.4, +(p.marketValue * 0.10 * (0.8 + Math.random() * 0.5) * (5 - tier) / 3).toFixed(1));
  return { ...c, tier, fee, wage, loan: !!loan, proj: roleFor(p.ovr, tier) };
}

export function clubInterest(p: Player): Offer[] {
  const willing: number[] = [];

  // Standard interest based on current ability
  if (p.ovr >= 84 || (p.ovr >= 82 && p.reputation >= 55)) willing.push(1);
  if (p.ovr >= 78 || (p.ovr >= 76 && p.reputation >= 40)) willing.push(2);
  if (p.ovr >= 71) willing.push(3);

  // Project signings: elite clubs buy young talent for potential, not just current OVR
  if (p.age <= 21 && p.potential >= 87 && !willing.includes(1)) willing.push(1);
  if (p.age <= 23 && p.potential >= 83 && !willing.includes(2)) willing.push(2);

  const offers: Offer[] = [], used = new Set([p.club]);

  // High reputation opens extra doors even without raw OVR
  const repBonus = p.reputation >= 70 ? 1 : 0;
  const youngTalentBid = p.age <= 21 && p.potential >= 87;
  const bids = p.ovr >= 84 ? 2 + repBonus
    : p.ovr >= 76 ? rnd(1, 2)
    : p.ovr >= 71 ? rnd(0, 2)
    : youngTalentBid ? rnd(1, 2)
    : 0;

  const tiers = [...new Set(willing)].sort((a, b) => a - b);
  for (let i = 0; i < bids && tiers.length; i++) {
    const tier = tiers[i % tiers.length];
    const pool = CLUBS[tier].filter((c) => !used.has(c.name));
    if (!pool.length) continue;
    const c = pick(pool); used.add(c.name); offers.push(buildOffer(p, c, tier));
  }
  return offers;
}

export function moneyMoveOffers(p: Player): Offer[] {
  const pool = MONEY_CLUBS.filter((c) => c.name !== p.club);
  const c = pick(pool);
  const fee = Math.max(1, Math.round(p.marketValue * (0.4 + Math.random() * 0.3)));
  // Wage is deliberately inflated — 2–3× what the player would normally command
  const wage = Math.max(1.5, +((p.marketValue * 0.10 + 0.5) * (2.2 + Math.random() * 0.8)).toFixed(1));
  return [{ name: c.name, league: c.league, tier: 3, fee, wage, loan: false, proj: roleFor(p.ovr, 3) }];
}

export function offersForPlaytime(p: Player, n = 2, loan = false): Offer[] {
  const out: Offer[] = [], used = new Set([p.club]);
  const cand = [3, 4, 2].filter((t) => roleFor(p.ovr, t) !== "bench");
  const tiers = cand.length ? cand : [4];
  for (let i = 0; i < n; i++) {
    const t = tiers[i % tiers.length];
    const pool = CLUBS[t].filter((c) => !used.has(c.name));
    if (!pool.length) continue;
    const c = pick(pool); used.add(c.name);
    const o = buildOffer(p, c, t, loan);
    if (loan) {
      // Loans involve a small arrangement fee; parent club continues covering most of the wage
      o.fee = Math.max(0.5, Math.round(p.marketValue * 0.12));
      o.wage = +(o.wage * 0.75).toFixed(1);
    }
    out.push(o);
  }
  return out;
}
