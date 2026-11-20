/** Gig Hunt: static tables and every line of copy. No logic here. */

export type Track = "web" | "mobile" | "data";
export type DistrictId =
  | "Whitefield"
  | "Electronic City"
  | "Koramangala"
  | "Indiranagar"
  | "Jayanagar"
  | "Malleshwaram";

export type District = { id: DistrictId; tax: number };

/** Pick order: cheapest commute first. */
export const DISTRICTS: readonly District[] = [
  { id: "Jayanagar", tax: 60 },
  { id: "Malleshwaram", tax: 60 },
  { id: "Indiranagar", tax: 90 },
  { id: "Koramangala", tax: 120 },
  { id: "Electronic City", tax: 200 },
  { id: "Whitefield", tax: 220 },
];

export const TRACKS: readonly Track[] = ["web", "mobile", "data"];
export const TRACK_NAMES: Record<Track, string> = { web: "Web", mobile: "Mobile", data: "Data" };
/** Short labels for the Day screen skill lines. */
export const TRACK_SHORT: Record<Track, string> = { web: "WEB", mobile: "MOB", data: "DATA" };

export type Listing = {
  id: string;
  title: string;
  /** The title without "Job", for the Day screen rows. */
  short: string;
  track: Track;
  level: number;
  startup: boolean;
  district: DistrictId;
  /** Pay per month in rupees (startup premium already applied). */
  pay: number;
};

export const LISTINGS: readonly Listing[] = [
  { id: "react", title: "React Job", short: "React", track: "web", level: 2, startup: false, district: "Koramangala", pay: 40000 },
  { id: "web-support", title: "Web Support Job", short: "Web Support", track: "web", level: 1, startup: false, district: "Jayanagar", pay: 25000 },
  { id: "node", title: "Node Backend Job", short: "Node Backend", track: "web", level: 3, startup: true, district: "Indiranagar", pay: 69000 },
  { id: "flutter", title: "Flutter Job", short: "Flutter", track: "mobile", level: 2, startup: true, district: "Koramangala", pay: 46000 },
  { id: "android", title: "Android Job", short: "Android", track: "mobile", level: 3, startup: false, district: "Whitefield", pay: 60000 },
  { id: "ios", title: "iOS Job", short: "iOS", track: "mobile", level: 5, startup: false, district: "Electronic City", pay: 120000 },
  { id: "data-analyst", title: "Data Analyst Job", short: "Data Analyst", track: "data", level: 1, startup: false, district: "Malleshwaram", pay: 25000 },
  { id: "ml", title: "ML Pipeline Job", short: "ML Pipeline", track: "data", level: 4, startup: true, district: "Whitefield", pay: 103500 },
];

/** Company pay by level. Startups pay 15% more (already applied in LISTINGS). */
export const PAY_BY_LEVEL: Record<number, number> = { 1: 25000, 2: 40000, 3: 60000, 4: 90000, 5: 120000 };

/** Every tunable number in one place. */
export const RULES = {
  days: 21,
  startBank: 15000,
  energyMax: 100,
  /** Energy below this ends the day automatically. */
  energyFloor: 10,
  maxLevel: 5,
  boardSize: 3,
  interviewEnergy: 25,
  tiffinCost: 120,
  tiffinEnergy: 10,
  /** A startup listing at this level or above needs a tiffin first. */
  tiffinLevel: 3,
  learnCost: 2000,
  learnEnergy: 30,
  freelancePay: 1200,
  freelanceEnergy: 40,
  rent: 4000,
  rentDays: [7, 14, 21] as readonly number[],
  chance: { base: 0.8, perDeficit: 0.18, startup: 0.1, floor: 0.05, cap: 0.9 },
} as const;

export const STORAGE_KEY = "gh:v1";
export const STATS_FILE = "my-bengaluru-stats.json";
export const STATS_VERSION = "1.0.0";

/** {name} placeholders are filled by fill() in rules.ts. */

export const CART = {
  title: "Gig Hunt",
  sticker: "NAMMA GIG HUNT",
  tagline: "Three weeks to land a first gig",
  lede: "A fresher, a PG room and ₹15,000. Interview, learn, eat your tiffin and keep the rent paid.",
  hint: "Pick a note on the wall. A to open, B to sleep.",
} as const;

export const TITLE = {
  header: "GIG HUNT",
  lede: "Three weeks. One gig. Pucca.",
  continue: "CONTINUE",
  saved: "DAY {d}  {bank}",
  new: "NEW RUN",
  discardQ: "Start over?",
  discardBody: "Your saved run will be gone.",
  discardKeep: "KEEP RUN",
  discardYes: "START OVER",
} as const;

export const PICK = {
  header: "PICK HOME",
  count: "{n} OF 6",
  q: "Where's your PG, macha?",
  note: "Trips from home are free.",
} as const;

export const DAY = {
  header: "DAY {d} OF 21",
  energy: "ENERGY {e}",
  home: "HOME",
  rowDone: "DONE",
  rowLevel: "L{n}",
  learn: "LEARN",
  tiffin: "TIFFIN",
  freelance: "GIG",
  sleep: "SLEEP",
  welcome: "Day 1. Three notes on the wall, macha.",
  morning: "Morning. Energy back to 100.",
  tiffinDone: "Tiffin done. Ready for a startup.",
  tiffinAgain: "Already ate. One tiffin is enough.",
  tiffinFirst: "Tiffin first, maga.",
  freelanceDone: "Freelance gig done. +{pay}.",
  tired: "Too tired for that. Sleep, maga.",
  autoEnd: "Out of energy. Day over.",
  sleepLine: "Lights out. Day {d} tomorrow.",
  red: "Bank in the red. Rent on day {d}.",
  rentSoon: "Rent tomorrow. ₹4,000.",
  done: "Already tried this one today.",
  empty: "No new notes today. Learn or earn.",
} as const;

export const DETAIL = {
  kindStartup: "STARTUP",
  kindCompany: "COMPANY",
  track: "{track}, level {n}",
  you: "You: {track} {n}",
  chance: "CHANCE",
  pay: "Pay",
  payValue: "{pay} a month",
  commute: "Commute",
  commuteHome: "Free from home",
  tiffinLabel: "Tiffin",
  total: "Total",
  totalValue: "{cost}, {e} energy",
  startup: "Startups pay 15% more.",
  company: "Steady company. Steady pay.",
  needTiffin: "Needs a tiffin first today.",
  tired: "Not enough energy today.",
} as const;

export const LEARN = {
  header: "LEARN",
  each: "{cost} EACH",
  cost: "One level costs ₹2,000 and 30 energy.",
  max: "{track} is maxed. Pucca.",
  done: "{track} is now level {n}. Nice, maga.",
} as const;

export const RESULT = {
  header: "INTERVIEW",
  headerRight: "DAY {d}",
  win: "They want you, maga!",
  lose: "Not this one, macha.",
  chance: "Chance was {p}%.",
  spent: "Spent {cost} and {e} energy.",
  tip: "Learn a bit, try again.",
  luck: "Just luck. Go again tomorrow.",
} as const;

export const OFFER = {
  title: "Job Offer Received",
  salaryLabel: "Salary Offered",
  perMonth: "a month",
  accept: "ACCEPT",
  keep: "KEEP HUNTING",
  kept: "Offer noted. Back to the wall.",
} as const;

export const ACCEPT = {
  title: "Accept?",
  body: "{title}, {pay} a month.",
  note: "The hunt ends here.",
  yes: "YES, ACCEPT",
  no: "NOT YET",
} as const;

export const RENT = {
  header: "RENT DAY",
  headerRight: "DAY {d}",
  paid: "Rent ₹4,000 paid.",
  paid2: "The room's still yours.",
  bank: "Bank  {bank}",
  next: "Next rent: day {d}",
  due: "Rent ₹4,000 due.",
  short: "Can't cover it this time.",
} as const;

export const END = {
  header: "MY BENGALURU STATS",
  accepted: "Offer Accepted",
  acceptedSub: "{title}, {pay}",
  rent: "Rent Due",
  rentSub: "The PG wants its rent, maga.",
  none: "No offer this time",
  noneSub: "Three weeks done. Next run, pucca.",
  day21: "Three weeks done",
  day21Sub: "{n} offers. You've got this, maga.",
  day21SubOne: "1 offer. You've got this, maga.",
  quit: "Run ended",
  quitSub: "Stats saved. Come back soon.",
  days: "DAYS",
  interviews: "INTERVIEWS",
  offers: "OFFERS",
  best: "BEST",
  bestNone: "NONE",
  bank: "BANK",
  share: "Save your stats to share.",
  button: "My Bengaluru Stats",
  saved: "Stats saved.",
  shared: "Sent to share.",
  shareFail: "Couldn't save. Try again.",
} as const;

export const PAUSE = {
  header: "PAUSED",
  headerRight: "DAY {d}",
  resume: "RESUME",
  help: "HOW TO PLAY",
  soundOn: "SOUND: ON",
  soundOff: "SOUND: OFF",
  quit: "END RUN",
  note: "Your run saves itself.",
} as const;

export const QUIT = {
  q: "End this run?",
  body: "Offers so far still count.",
  keep: "NO",
  yes: "YES, END",
} as const;

export const HELP = [
  "Three weeks to land a first gig.",
  "Pick a note, check the chance, apply.",
  "Learn skills to raise your chances.",
  "Startups L3+ need a tiffin first.",
  "Rent ₹4,000 on days 7, 14 and 21.",
  "Freelance pays ₹1,200 when you're low.",
] as const;

export const SYS = {
  storageBlocked: "Can't save here. This run lasts this tab.",
} as const;

export const A11Y = {
  scene: "Your PG desk. {n} job notes on the wall.",
  chance: "Chance of an offer: {p} percent.",
  levels: "{track} level {n} of 5.",
} as const;
