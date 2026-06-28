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

  // ── Existing decisions ────────────────────────────────────────────────────

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
    body: "You're carrying a minor knock into a big run of fixtures.",
    a: { label: "Play through the pain", note: "Risky, but you won't lose your place.", apply: (q) => { q.injuryRisk += 0.18; } },
    b: { label: "Rest and recover", note: "Fewer games now, fresher later.", apply: (q) => { q.forceRest = true; q.injuryRisk = Math.max(0, q.injuryRisk - 0.1); } },
  });

  ev.push({
    title: "Contract noise",
    body: "Your agent says you're underpaid and wants to force a raise.",
    a: { label: "Push for more money", note: "Bigger wage, a little bad press.", apply: (q) => { q.wage = +(q.wage * 1.4).toFixed(1); q.reputation = clamp(q.reputation - 5, 0, 100); } },
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

  // ── New decisions ─────────────────────────────────────────────────────────

  ev.push({
    title: "Surgeon's advice",
    body: "A scan reveals a structural issue the surgeon says should be fixed now, before it becomes serious.",
    a: { label: "Have the surgery", note: "Six weeks out, but the problem is solved properly.", apply: (q) => { q.forceRest = true; q.injuryRisk = Math.max(0, q.injuryRisk - 0.22); } },
    b: { label: "Manage it with injections", note: "Keep playing — but the risk grows.", apply: (q) => { q.injuryRisk += 0.24; } },
  });

  ev.push({
    title: "Pre-season alarm",
    body: "A knock in pre-season has the physio cautious. The manager needs you for the opener.",
    a: { label: "Sit out the first month", note: "Fresh when it matters, not just ready.", apply: (q) => { q.forceRest = true; q.injuryRisk = Math.max(0, q.injuryRisk - 0.08); } },
    b: { label: "Grit through it", note: "Play through discomfort — the season won't wait.", apply: (q) => { q.injuryRisk += 0.14; } },
  });

  if (p.injuryRisk > 0.05) ev.push({
    title: "Comeback gamble",
    body: "You're ahead of schedule. The medical team says the safe option is another two weeks. The manager says the team needs you now.",
    a: { label: "Rush back for the big game", note: "High risk — your body may not hold.", apply: (q) => { q.injuryRisk += 0.20; } },
    b: { label: "Take the full recovery time", note: "Miss this one. Return at 100%.", apply: (q) => { q.forceRest = true; q.injuryRisk = Math.max(0, q.injuryRisk - 0.14); } },
  });

  if (p.age >= 26) ev.push({
    title: "Body management",
    body: "Your analytics show wear in your movement data. The conditioning coach wants to reduce your training load.",
    a: { label: "Train smarter, not harder", note: "Fresher for matchday, lower injury risk.", apply: (q) => { q.injuryRisk = Math.max(0, q.injuryRisk - 0.08); q.consistency = clamp(q.consistency + 0.02, 0.7, 1.1); } },
    b: { label: "Keep the intensity up", note: "You don't want to lose your edge.", apply: (q) => { q.ovr = clamp(q.ovr + 1, 50, q.potential); q.injuryRisk += 0.07; } },
  });

  ev.push({
    title: "New manager",
    body: "A new head coach arrives and makes clear he has doubts about your fit in his system.",
    a: { label: "Win him over in training", note: "Force his hand. Earn your place.", apply: (q) => { q.consistency = clamp(q.consistency + 0.04, 0.7, 1.1); q.ovr = clamp(q.ovr + 1, 50, q.potential); } },
    b: { label: "Push for a move", note: "Life's too short for a manager who doesn't rate you.", apply: (q) => { q.wantAway = true; q.reputation = clamp(q.reputation - 3, 0, 100); } },
  });

  if (p.age >= 19) ev.push({
    title: "Training ground fallout",
    body: "You clashed publicly with the manager after being dropped for a big match. The dressing room heard everything.",
    a: { label: "Apologise and reset", note: "Swallow your pride. Relationships matter.", apply: (q) => { q.reputation = clamp(q.reputation - 2, 0, 100); q.consistency = clamp(q.consistency + 0.04, 0.7, 1.1); } },
    b: { label: "Stand your ground publicly", note: "You said what needed saying — but it has a cost.", apply: (q) => { q.reputation = clamp(q.reputation + (chance(0.4) ? 4 : -10), 0, 100); } },
  });

  if (p.age >= 22 && !benched) ev.push({
    title: "Tactical sacrifice",
    body: "The manager wants you to drop into a pressing role — less on the ball, more running. A team-first ask.",
    a: { label: "Buy in fully", note: "The team wins, you win.", apply: (q) => { q.reputation = clamp(q.reputation + 5, 0, 100); q.consistency = clamp(q.consistency + 0.03, 0.7, 1.1); } },
    b: { label: "Play your natural game", note: "Your best football doesn't fit that mould.", apply: (q) => { q.ovr = clamp(q.ovr + 1, 50, q.potential); q.reputation = clamp(q.reputation - 3, 0, 100); } },
  });

  if (p.age >= 26 && p.ovr >= 76) ev.push({
    title: "Dressing room fracture",
    body: "The squad is divided after a run of bad results. As one of the senior figures, you're expected to step up.",
    a: { label: "Take the lead", note: "Glue the group back together.", apply: (q) => { q.reputation = clamp(q.reputation + 8, 0, 100); q.consistency = clamp(q.consistency + 0.03, 0.7, 1.1); } },
    b: { label: "Keep your head down", note: "Not your circus, not your monkeys.", apply: (q) => { q.reputation = clamp(q.reputation + 1, 0, 100); } },
  });

  if (p.ovr >= 72) ev.push({
    title: "Late-night TV",
    body: "A popular show wants you on. Great for your profile, but training starts at 8am.",
    a: { label: "Do the show", note: "The exposure is worth it — probably.", apply: (q) => { q.reputation = clamp(q.reputation + 4, 0, 100); q.mvMod += 0.01; q.injuryRisk += 0.03; } },
    b: { label: "Decline politely", note: "Rest is a performance tool.", apply: () => {} },
  });

  if (p.age >= 20 && p.age <= 31) ev.push({
    title: "Agent switch",
    body: "A top super-agent known for brokering blockbuster deals wants to take over your representation.",
    a: { label: "Make the switch", note: "Bigger deals on the horizon — at a cost to your image.", apply: (q) => { q.wage = +(q.wage * 1.25).toFixed(1); q.reputation = clamp(q.reputation - 3, 0, 100); } },
    b: { label: "Stay loyal to your current agent", note: "Loyalty counts. So does stability.", apply: (q) => { q.reputation = clamp(q.reputation + 2, 0, 100); } },
  });

  if (p.age >= 28 && p.ovr >= 76) ev.push({
    title: "Youth mentoring",
    body: "A raw 17-year-old is training with the first team. The club asks you to take him under your wing.",
    a: { label: "Be his guide", note: "Your reputation grows. So does his.", apply: (q) => { q.reputation = clamp(q.reputation + 5, 0, 100); q.mvMod += 0.02; } },
    b: { label: "Focus on your own season", note: "You've got enough on your plate.", apply: () => {} },
  });

  ev.push({
    title: "Club financial squeeze",
    body: "The club is under financial pressure and asks senior players to temporarily reduce their wages.",
    a: { label: "Accept the deferral", note: "Fans hero. Costs you short-term.", apply: (q) => { q.wage = +(q.wage * 0.82).toFixed(1); q.reputation = clamp(q.reputation + 9, 0, 100); } },
    b: { label: "Refuse — a contract is a contract", note: "Principles intact. Relationship strained.", apply: (q) => { q.reputation = clamp(q.reputation - 5, 0, 100); q.wantAway = true; } },
  });

  ev.push({
    title: "Intensity dial",
    body: "Your GPS data shows you're pressing harder than anyone else in the squad. The staff want to protect you.",
    a: { label: "Dial it back", note: "Smarter use of energy over the long season.", apply: (q) => { q.injuryRisk = Math.max(0, q.injuryRisk - 0.06); q.consistency = clamp(q.consistency + 0.02, 0.7, 1.1); } },
    b: { label: "Keep the intensity — it's who you are", note: "Your engine is your edge.", apply: (q) => { q.ovr = clamp(q.ovr + 1, 50, q.potential); q.injuryRisk += 0.09; } },
  });

  if (p.age >= 20 && p.ovr >= 74 && !benched) ev.push({
    title: "Rival in the press",
    body: "Your direct rival for the position has been getting all the column inches. The media want a reaction.",
    a: { label: "Let it fuel you", note: "Use the disrespect as motivation.", apply: (q) => { q.ovr = clamp(q.ovr + 1, 50, q.potential); q.consistency = clamp(q.consistency + 0.02, 0.7, 1.1); } },
    b: { label: "Ignore it, stay focused", note: "Silence is a statement.", apply: (q) => { q.reputation = clamp(q.reputation + 2, 0, 100); } },
  });

  if (p.age >= 27) ev.push({
    title: "Sports psychologist",
    body: "The club has brought in a new sports psychologist. Completely voluntary — but several teammates swear by it.",
    a: { label: "Give it a proper go", note: "Mental sharpness is physical sharpness.", apply: (q) => { q.consistency = clamp(q.consistency + 0.05, 0.7, 1.1); q.injuryRisk = Math.max(0, q.injuryRisk - 0.04); } },
    b: { label: "You're fine the way you are", note: "Old-school approach. No harm in it.", apply: () => {} },
  });

  if (p.age <= 24) ev.push({
    title: "Social media presence",
    body: "Your management team wants to build your personal brand online. Vlogs, posts, the full package.",
    a: { label: "Lean in — build the brand", note: "Profile rises. Distractions too.", apply: (q) => { q.mvMod += 0.03; q.reputation = clamp(q.reputation + 3, 0, 100); q.consistency = clamp(q.consistency - 0.02, 0.7, 1.1); } },
    b: { label: "Keep a low profile", note: "Let your football do the talking.", apply: (q) => { q.consistency = clamp(q.consistency + 0.02, 0.7, 1.1); } },
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
  const score = careerScore(c);
  // Generational icon: needs elite score OR the double GOAT marker (multiple Ballons)
  if (score >= 78 || c.ballonDors >= 2 || (c.worldCups >= 1 && c.peakOvr >= 93))
    return { tier: "Generational Icon", emoji: "🐐", color: "var(--gold)" };
  // World-class: 55+ score, or 1 Ballon, or World Cup + UCL double
  if (score >= 55 || c.ballonDors >= 1 || (c.worldCups >= 1 && c.ucls >= 1))
    return { tier: "World-Class Legend", emoji: "👑", color: "var(--gold)" };
  // Top-tier: solid score, or at least one of the big individual trophies
  if (score >= 33 || c.worldCups >= 1 || c.ucls >= 1)
    return { tier: "Top-Tier Star", emoji: "⭐", color: "var(--lime)" };
  // Solid pro: respectable career, maybe a league title or two
  if (score >= 16)
    return { tier: "Solid Pro", emoji: "✅", color: "#7fd4ff" };
  // Journeyman: played for years without much silverware
  if (score >= 7)
    return { tier: "Journeyman", emoji: "🧳", color: "#9aa0a6" };
  return { tier: "Faded Talent", emoji: "💤", color: "#7a7a7a" };
}
