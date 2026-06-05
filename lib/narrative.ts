import { pick } from "./helpers";
import type { Season, Player } from "./types";

const POOL: Record<string, string[]> = {
  ballon: ["Untouchable. The whole sport bends around you.", "A season for the ages — the best player alive.", "You didn't just win games, you redefined them."],
  injury: ["A cruel injury swallowed half your season.", "Stop-start year — the physios saw too much of you.", "Your body betrayed you at the worst time.", "Months lost to the treatment room."],
  breakout: ["The breakout. Scouts across Europe are circling.", "Something clicked — you look a level above.", "From prospect to problem-for-defenders overnight.", "The year people started saying your name properly."],
  bench: ["Barely featured — mostly a view from the bench.", "Game time dried up. The whispers started.", "A frustrating, forgettable year on the fringes.", "You trained well. You played little.", "The manager just didn't fancy you."],
  youth: ["Tearing it up in the youth ranks.", "The academy staff can't stop talking about you.", "Catching the first team's eye in training.", "A standout year in the reserves."],
  ucl: ["European glory under the lights. Unforgettable.", "Champions of Europe. Nothing tops that night.", "You conquered the continent."],
  league: ["Champions. You delivered when it mattered most.", "Title secured — the city throws a party.", "Top of the pile. A deserved crown."],
  fwdHot: ["Goals, goals, goals — the fans chant your name.", "You couldn't stop scoring this year.", "Defenders had nightmares about you."],
  midHot: ["You ran the midfield from whistle to whistle.", "Every good move went through you.", "The metronome — you set the tempo all year."],
  defHot: ["A wall at the back. Strikers bounced off you.", "Rock solid — a defender's defender.", "Nothing got past you this season."],
  gkHot: ["Save after save — a brick wall in goal.", "Clean sheets piled up behind you.", "You bailed the team out week after week."],
  neutral: ["A steady, professional campaign.", "Quietly effective — you did your job.", "Ups and downs, but you held your place.", "Unspectacular, but dependable.", "A grind of a season, nothing flashy.", "You kept the shirt and little else changed."],
};

export function seasonHeadline(s: Season, p: Player): string {
  let pool: string[];
  if (s.role === "youth") pool = POOL.youth;
  else if (s.ballon) pool = POOL.ballon;
  else if (s.injured) pool = POOL.injury;
  else if (s.role === "bench") pool = POOL.bench;
  else if (s.breakout) pool = POOL.breakout;
  else if (s.trophies.includes("Champions League")) pool = POOL.ucl;
  else if (s.trophies.includes("League Title")) pool = POOL.league;
  else if (p.position === "FWD" && s.goals >= 18) pool = POOL.fwdHot;
  else if (p.position === "MID" && s.assists >= 11) pool = POOL.midHot;
  else if (p.position === "DEF" && s.clean >= 13) pool = POOL.defHot;
  else if (p.position === "GK" && s.clean >= 14) pool = POOL.gkHot;
  else pool = POOL.neutral;
  return pick(pool);
}

export const TOURN_RESULT: Record<string, { color: string }> = {
  Winner: { color: "var(--gold)" },
  Final: { color: "#ff9d54" },
  "Semi-final": { color: "#7fd4ff" },
  "Quarter-final": { color: "var(--muted)" },
  "Group stage": { color: "var(--muted)" },
};
