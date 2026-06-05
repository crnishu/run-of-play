export interface Country {
  name: string;
  flag: string;
  club: string;
  strength: number;
  cup: string;
}

export interface Position {
  code: "FWD" | "MID" | "DEF" | "GK";
  label: string;
  desc: string;
}

export interface ClubEntry {
  name: string;
  league: string;
}

export interface Tournament {
  type: string;
  isWC: boolean;
  result: string;
  goals: number;
}

export interface Season {
  season: string;
  year: number;
  age: number;
  club: string;
  ovr: number;
  prevOvr: number;
  apps: number;
  goals: number;
  assists: number;
  clean: number;
  rating: number;
  trophies: string[];
  ballon: boolean;
  caps: number;
  intlGoals: number;
  injured: boolean;
  breakout: boolean;
  role: string;
  tourney: Tournament | null;
  graduated: boolean;
  gradBoost: number;
  mv: number;
}

export interface Player {
  name: string;
  country: Country;
  position: string;
  age: number;
  year: number;
  ovr: number;
  prevOvr: number;
  potential: number;
  peakOvr: number;
  consistency: number;
  devBonus: number;
  academy: string;
  club: string;
  clubTier: number;
  league: string;
  reputation: number;
  wage: number;
  earnings: number;
  brandEarnings: number;
  mvMod: number;
  marketValue: number;
  peakMarketValue: number;
  contractYears: number;
  seasonsAtClub: number;
  youthYears: number;
  injuryRisk: number;
  forceRest: boolean;
  retiredFromIntl: boolean;
  wantAway: boolean;
  lastApps: number;
  lastRole: string;
}

export interface Career {
  clubApps: number;
  clubGoals: number;
  clubAssists: number;
  clubClean: number;
  caps: number;
  intlGoals: number;
  leagueTitles: number;
  cups: number;
  ucls: number;
  ballonDors: number;
  worldCups: number;
  contCups: number;
  peakOvr: number;
}

export interface Offer {
  name: string;
  league: string;
  tier: number;
  fee: number;
  wage: number;
  loan: boolean;
  proj: string;
}

export interface DecisionOption {
  label: string;
  note: string;
  apply: (p: Player) => void;
}

export interface Decision {
  title: string;
  body: string;
  a: DecisionOption;
  b: DecisionOption;
}

export interface Renewal {
  years: number;
  wage: number;
}
