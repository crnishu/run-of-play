import { CLUBS, CLUB_LEAGUE, TIER_LABEL } from "./clubs";
import { rnd, pick, roleFor } from "./helpers";
import type { Player, Offer } from "./types";

export function buildOffer(p: Player, c: { name: string; league: string }, tier: number, loan?: boolean): Offer {
  const fee = Math.max(1, Math.round(p.marketValue * (0.8 + (4 - tier) * 0.22 + Math.random() * 0.5)));
  const wage = Math.max(0.4, +(p.marketValue * 0.06 * (0.8 + Math.random() * 0.5) * (5 - tier) / 3).toFixed(1));
  return { ...c, tier, fee, wage, loan: !!loan, proj: roleFor(p.ovr, tier) };
}

export function clubInterest(p: Player): Offer[] {
  const willing: number[] = [];
  if (p.ovr >= 84 || (p.ovr >= 82 && p.reputation >= 55)) willing.push(1);
  if (p.ovr >= 78 || (p.ovr >= 76 && p.reputation >= 40)) willing.push(2);
  if (p.ovr >= 71) willing.push(3);
  const offers: Offer[] = [], used = new Set([p.club]);
  const bids = p.ovr >= 84 ? 2 : p.ovr >= 76 ? rnd(1, 2) : p.ovr >= 71 ? rnd(0, 2) : 0;
  const tiers = [...new Set(willing)].sort((a, b) => a - b);
  for (let i = 0; i < bids && tiers.length; i++) {
    const tier = tiers[i % tiers.length];
    const pool = CLUBS[tier].filter((c) => !used.has(c.name));
    if (!pool.length) continue;
    const c = pick(pool); used.add(c.name); offers.push(buildOffer(p, c, tier));
  }
  return offers;
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
    if (loan) { o.fee = Math.round(o.fee * 0.3); o.wage = +(o.wage * 0.85).toFixed(1); }
    out.push(o);
  }
  return out;
}
