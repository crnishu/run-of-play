import { rnd, pick, chance, clamp } from "./helpers";
import type { Player, Decision, Career } from "./types";

export function brandEvent(p: Player): Decision {
  let brand: string, money: number, mv: number;
  if (p.ovr < 72) { brand = "a regional sportswear label"; money = rnd(1, 3); mv = 0.02; }
  else if (p.ovr < 80) { brand = "a well-known national brand"; money = rnd(3, 7); mv = 0.04; }
  else if (p.ovr < 88) { brand = "a major global brand"; money = rnd(7, 15); mv = 0.05; }
  else { brand = "the biggest sportswear giant on earth"; money = rnd(15, 30); mv = 0.07; }
  return {
    title: "Brand deal",
    body: `${brand} wants you to front their new campaign. €${money}M on the table.`,
    a: {
      label: "Sign the deal",
      note: `+€${money}M off the pitch, profile rises.`,
      apply: (q) => { q.brandEarnings += money; q.mvMod += mv; q.reputation = clamp(q.reputation + 3, 0, 100); },
    },
    b: { label: "Stay focused on football", note: "Keep the noise down.", apply: () => {} },
  };
}

export function buildDecision(p: Player, recent: string[]): Decision {
  const benched = p.lastRole === "bench";
  const ev: Decision[] = [];

  if (p.ovr >= 80 && !benched) ev.push({
    title: "Captain's armband",
    body: "The manager offers you the captaincy — more responsibility, more spotlight.",
    a: { label: "Accept the armband", note: "You take the lead.", apply: (q) => { q.reputation = clamp(q.reputation + 9, 0, 100); q.mvMod += 0.02; } },
    b: { label: "Focus on your own game", note: "Let someone else lead.", apply: () => {} },
  });

  if (p.age <= 25) ev.push({
    title: "Position tweak",
    body: "Coaches think a role change could unlock another level in you.",
    a: { label: "Embrace the new role", note: "A gamble that could raise your ceiling.", apply: (q) => { q.potential = clamp(q.potential + rnd(1, 3), 50, 96); q.ovr = clamp(q.ovr + 1, 50, q.potential); } },
    b: { label: "Stick to what you know", note: "Don't fix what works.", apply: () => {} },
  });

  if (p.age <= 23) ev.push({
    title: "A veteran's wing",
    body: "A club legend offers to take you under his wing this season.",
    a: { label: "Learn everything you can", note: "Maturity and know-how rub off.", apply: (q) => { q.consistency = clamp(q.consistency + 0.05, 0.7, 1.1); q.ovr = clamp(q.ovr + 1, 50, q.potential); } },
    b: { label: "Trust your own path", note: "You do it your way.", apply: () => {} },
  });

  ev.push({
    title: "Niggling knock",
    body: "You're carrying a minor injury into a big run of fixtures.",
    a: { label: "Play through the pain", note: "Risky, but you won't lose your place.", apply: (q) => { q.injuryRisk += 0.18; } },
    b: { label: "Rest and recover", note: "Fewer games now, fresher later.", apply: (q) => { q.forceRest = true; q.injuryRisk = Math.max(0, q.injuryRisk - 0.1); } },
  });

  ev.push({
    title: "Contract noise",
    body: "Your agent says you're underpaid and wants to force a raise.",
    a: { label: "Push for more money", note: "Bigger packet, a little bad press.", apply: (q) => { q.wage = +(q.wage * 1.4).toFixed(1); q.reputation = clamp(q.reputation - 5, 0, 100); } },
    b: { label: "Keep your head down", note: "The fans appreciate the humility.", apply: (q) => { q.reputation = clamp(q.reputation + 3, 0, 100); } },
  });

  ev.push({
    title: "Social media storm",
    body: "An old post of yours has resurfaced and the internet is loud about it.",
    a: { label: "Address it head-on", note: "Honesty — could go either way.", apply: (q) => { q.reputation = clamp(q.reputation + (chance(0.6) ? 6 : -8), 0, 100); } },
    b: { label: "Go quiet and ride it out", note: "Let it blow over.", apply: (q) => { q.reputation = clamp(q.reputation - 2, 0, 100); } },
  });

  ev.push({
    title: "Charity foundation",
    body: "You're invited to launch a foundation back in your hometown.",
    a: { label: "Throw yourself into it", note: "Beloved off the pitch.", apply: (q) => { q.reputation = clamp(q.reputation + 6, 0, 100); q.mvMod += 0.02; } },
    b: { label: "Maybe later in your career", note: "Football first, for now.", apply: () => {} },
  });

  if (p.age >= 24 && p.age <= 30) ev.push({
    title: "Fitness overhaul",
    body: "A new performance coach wants to rebuild your training and diet.",
    a: { label: "Commit fully", note: "Sharper, more durable.", apply: (q) => { q.injuryRisk = Math.max(0, q.injuryRisk - 0.06); q.ovr = clamp(q.ovr + 1, 50, q.potential); } },
    b: { label: "Keep your routine", note: "If it ain't broke…", apply: () => {} },
  });

  if (p.age >= 31 && !p.retiredFromIntl && p.ovr >= 73) ev.push({
    title: "International future",
    body: "The legs aren't what they were. Keep answering your country's call?",
    a: { label: "Retire from internationals", note: "Save your body for the club.", apply: (q) => { q.retiredFromIntl = true; q.injuryRisk = Math.max(0, q.injuryRisk - 0.05); } },
    b: { label: "Play on for your country", note: "Pride over preservation.", apply: () => {} },
  });

  const filtered = ev.filter((e) => !recent.includes(e.title));
  return pick(filtered.length ? filtered : ev);
}

export function careerScore(c: Career): number {
  const ovrPts = clamp((c.peakOvr - 60) / 35 * 40, 0, 40);
  const rawTrophy =
    c.ballonDors * 18 +
    c.worldCups * 14 +
    c.ucls * 9 +
    c.contCups * 7 +
    c.leagueTitles * 4 +
    c.cups * 1;
  return Math.round(clamp(ovrPts + clamp(rawTrophy, 0, 60), 0, 100));
}

export function legacy(c: Career): { tier: string; emoji: string; color: string } {
  if (c.ballonDors >= 2 || (c.worldCups >= 1 && c.peakOvr >= 93))
    return { tier: "Generational Icon", emoji: "🐐", color: "var(--gold)" };
  if (c.ballonDors >= 1 || c.ucls >= 2 || c.worldCups >= 1 || c.peakOvr >= 90)
    return { tier: "World-Class Legend", emoji: "👑", color: "var(--gold)" };
  if (c.ucls >= 1 || c.leagueTitles >= 3 || c.peakOvr >= 86)
    return { tier: "Top-Tier Star", emoji: "⭐", color: "var(--lime)" };
  if (c.peakOvr >= 78 || c.leagueTitles >= 1)
    return { tier: "Solid Pro", emoji: "✅", color: "#7fd4ff" };
  if (c.peakOvr >= 72)
    return { tier: "Journeyman", emoji: "🧳", color: "#9aa0a6" };
  return { tier: "Faded Talent", emoji: "💤", color: "#7a7a7a" };
}
