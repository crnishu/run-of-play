import type { ClubEntry, Country, Position } from "./types";

const LEAGUE_CLUBS: Record<string, [string, number, string][]> = {
  "Premier League": [
    ["Man City", 1, "#6cabdd"], ["Liverpool", 1, "#c8102e"], ["Arsenal", 1, "#ef0107"],
    ["Chelsea", 2, "#0a4ea8"], ["Man United", 2, "#da291c"], ["Tottenham", 2, "#1c2b54"], ["Newcastle", 2, "#9fb6c8"],
    ["Aston Villa", 3, "#7a1244"], ["Brighton", 3, "#0057b8"], ["West Ham", 3, "#7a263a"], ["Crystal Palace", 3, "#1b458f"],
    ["Everton", 4, "#1a4fbf"], ["Fulham", 4, "#cfcfcf"], ["Brentford", 4, "#e30613"], ["Wolves", 4, "#fdb913"],
    ["Nottm Forest", 4, "#dd0000"], ["Bournemouth", 4, "#da291c"], ["Southampton", 4, "#d71920"],
  ],
  "La Liga": [
    ["Real Madrid", 1, "#c9a23a"], ["Barcelona", 1, "#004d98"], ["Atlético Madrid", 2, "#cb3524"],
    ["Athletic Bilbao", 3, "#ee2523"], ["Real Sociedad", 3, "#0067b1"], ["Real Betis", 3, "#0a8c4a"],
    ["Villarreal", 3, "#d9c64a"], ["Valencia", 3, "#f18e00"], ["Girona", 3, "#d4202a"], ["Sevilla", 3, "#d81e05"],
    ["Getafe", 4, "#0a63a8"], ["Osasuna", 4, "#0a346f"], ["Celta Vigo", 4, "#8ac3ee"], ["Mallorca", 4, "#c8102e"],
  ],
  Bundesliga: [
    ["Bayern Munich", 1, "#dc052d"], ["Leverkusen", 2, "#e32219"], ["Dortmund", 2, "#d6c000"], ["RB Leipzig", 2, "#dd0741"],
    ["Stuttgart", 3, "#cf2d2d"], ["Eintracht Frankfurt", 3, "#be1622"], ["Wolfsburg", 3, "#65b32e"], ["Freiburg", 3, "#e2001a"],
    ["Hoffenheim", 4, "#1c63b7"], ["Augsburg", 4, "#ba3733"], ["Werder Bremen", 4, "#1d9053"], ["Mönchengladbach", 4, "#1f9e4b"],
    ["Union Berlin", 4, "#eb1923"], ["Mainz", 4, "#c3141e"],
  ],
  "Ligue 1": [
    ["Paris SG", 1, "#1d4e89"], ["Marseille", 2, "#2faee0"], ["Monaco", 2, "#e51b22"],
    ["Lyon", 3, "#cf1020"], ["Lille", 3, "#e01e24"], ["Nice", 3, "#cc0000"], ["Lens", 3, "#ffe200"], ["Rennes", 3, "#e23636"],
    ["Nantes", 4, "#fcda00"], ["Strasbourg", 4, "#0099d8"], ["Le Havre", 4, "#5b9bd5"], ["Brest", 4, "#e2001a"],
    ["Toulouse", 4, "#6f1d8f"], ["Reims", 4, "#d4202a"],
  ],
  "Serie A": [
    ["Inter Milan", 2, "#0068a8"], ["Juventus", 2, "#bdbdbd"], ["AC Milan", 2, "#fb090b"], ["Napoli", 2, "#12a0d7"],
    ["AS Roma", 3, "#9e1a1a"], ["Lazio", 3, "#87d8f7"], ["Atalanta", 3, "#1d71b8"], ["Fiorentina", 3, "#7b2e8e"], ["Bologna", 3, "#9a1e20"],
    ["Torino", 4, "#7a1a1a"], ["Lecce", 4, "#d4202a"], ["Empoli", 4, "#1565c0"], ["Udinese", 4, "#bdbdbd"],
  ],
  Eredivisie: [["Ajax", 2, "#d2122e"], ["PSV", 2, "#ed1c24"], ["Feyenoord", 3, "#e30613"]],
  Primeira: [["Benfica", 2, "#d80000"], ["Porto", 2, "#0046a8"], ["Sporting CP", 3, "#0a8c5a"]],
  MLS: [
    ["Inter Miami", 3, "#f7b5cd"], ["LAFC", 3, "#c39e6d"], ["LA Galaxy", 4, "#1a4fbf"], ["Seattle Sounders", 4, "#5d9741"],
    ["Atlanta Utd", 4, "#9a1530"], ["Columbus Crew", 4, "#e0c200"], ["FC Cincinnati", 4, "#f05323"],
  ],
  Other: [
    ["Flamengo", 4, "#d4202a"], ["Boca Juniors", 4, "#0a3d91"], ["Peñarol", 4, "#d6a500"], ["Dinamo Zagreb", 4, "#0067b1"],
    ["Génération Foot", 4, "#1b9e4b"], ["Enyimba", 4, "#cf1020"], ["Kawasaki", 4, "#0a8fd6"], ["Molde", 4, "#1d4e9c"],
  ],
};

export const CLUBS: Record<number, ClubEntry[]> = { 1: [], 2: [], 3: [], 4: [] };
export const CLUB_COLORS: Record<string, string> = {};
export const CLUB_LEAGUE: Record<string, string> = {};
export const CLUB_TIER: Record<string, number> = {};

for (const [league, list] of Object.entries(LEAGUE_CLUBS)) {
  for (const [name, tier, color] of list) {
    CLUBS[tier].push({ name, league });
    CLUB_COLORS[name] = color;
    CLUB_LEAGUE[name] = league;
    CLUB_TIER[name] = tier as number;
  }
}

export const ACADEMY_CLUBS: [string, number][] = [
  ["Barcelona", 0.18], ["Real Madrid", 0.15], ["Ajax", 0.22], ["Man City", 0.15], ["Bayern Munich", 0.14],
  ["Dortmund", 0.16], ["Benfica", 0.17], ["Sporting CP", 0.18], ["Lyon", 0.16], ["PSV", 0.16],
  ["Atlético Madrid", 0.13], ["Arsenal", 0.13], ["Chelsea", 0.13], ["AC Milan", 0.14], ["Porto", 0.15],
];

export const COUNTRIES: Country[] = [
  { name: "France", flag: "🇫🇷", club: "Lyon", strength: 5, cup: "European Championship" },
  { name: "Brazil", flag: "🇧🇷", club: "Flamengo", strength: 5, cup: "Copa América" },
  { name: "Argentina", flag: "🇦🇷", club: "Boca Juniors", strength: 5, cup: "Copa América" },
  { name: "Spain", flag: "🇪🇸", club: "Real Betis", strength: 4, cup: "European Championship" },
  { name: "England", flag: "🏴", club: "Southampton", strength: 4, cup: "European Championship" },
  { name: "Portugal", flag: "🇵🇹", club: "Sporting CP", strength: 4, cup: "European Championship" },
  { name: "Germany", flag: "🇩🇪", club: "Stuttgart", strength: 4, cup: "European Championship" },
  { name: "Netherlands", flag: "🇳🇱", club: "Ajax", strength: 4, cup: "European Championship" },
  { name: "Croatia", flag: "🇭🇷", club: "Dinamo Zagreb", strength: 3, cup: "European Championship" },
  { name: "Uruguay", flag: "🇺🇾", club: "Peñarol", strength: 3, cup: "Copa América" },
  { name: "Italy", flag: "🇮🇹", club: "Bologna", strength: 3, cup: "European Championship" },
  { name: "Senegal", flag: "🇸🇳", club: "Génération Foot", strength: 2, cup: "Africa Cup" },
  { name: "Nigeria", flag: "🇳🇬", club: "Enyimba", strength: 2, cup: "Africa Cup" },
  { name: "Japan", flag: "🇯🇵", club: "Kawasaki", strength: 2, cup: "Asian Cup" },
  { name: "USA", flag: "🇺🇸", club: "Atlanta Utd", strength: 2, cup: "Gold Cup" },
  { name: "Norway", flag: "🇳🇴", club: "Molde", strength: 2, cup: "European Championship" },
];

export const POSITIONS: Position[] = [
  { code: "FWD", label: "Striker", desc: "Score the goals. Steal the headlines." },
  { code: "MID", label: "Midfielder", desc: "Run the game. Pull the strings." },
  { code: "DEF", label: "Defender", desc: "Stop everything. Build from the back." },
  { code: "GK", label: "Goalkeeper", desc: "The last line. The cool head." },
];

export const EXPECTED: Record<number, number> = { 1: 84, 2: 79, 3: 74, 4: 67 };
export const TIER_LABEL: Record<number, string> = { 1: "Elite", 2: "Big club", 3: "Mid-table", 4: "Smaller side" };
