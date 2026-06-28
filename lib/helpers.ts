import { CLUB_COLORS, EXPECTED } from "./clubs";

export const rnd = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const chance = (p: number) => Math.random() < p;
export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

export const ovrColor = (o: number) =>
  o >= 88 ? "var(--gold)" : o >= 80 ? "var(--lime)" : o >= 72 ? "#7fd4ff" : "#9aa0a6";

export function hexToRgba(hex: string | undefined, a: number): string {
  const h = (hex || "#163526").replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

export const clubGlow = (n: string) => CLUB_COLORS[n] || "#163526";
export const clubTint = (n: string) => hexToRgba(clubGlow(n), 0.3);

export function roleFor(ovr: number, tier: number): string {
  const e = EXPECTED[tier];
  return ovr >= e ? "starter" : ovr >= e - 5 ? "rotation" : "bench";
}

export const roleLabel: Record<string, string> = {
  starter: "Nailed-on starter",
  rotation: "Rotation option",
  bench: "Bench / squad player",
  youth: "Academy prospect",
};

export const roleColor: Record<string, string> = {
  starter: "var(--lime)",
  rotation: "#7fd4ff",
  bench: "#ff7a7a",
  youth: "var(--gold)",
};

// Maps a legacy tier name to a FUT-style card metal (drives the .fut--* classes)
export function cardTier(tier: string): "icon" | "goldrare" | "gold" | "silver" | "bronze" | "faded" {
  switch (tier) {
    case "Generational Icon": return "icon";
    case "World-Class Legend": return "goldrare";
    case "Top-Tier Star": return "gold";
    case "Solid Pro": return "silver";
    case "Journeyman": return "bronze";
    default: return "faded";
  }
}
