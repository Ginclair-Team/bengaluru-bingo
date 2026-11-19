// Static data and copy for the pet game (spec sections A, D3, D6 and E). No logic.
// Lines that name the pet use the token {name}; copy.ts fills it in.

export const AREAS = ["Malleshwaram", "Jayanagar", "Indiranagar"] as const;
export type Area = (typeof AREAS)[number];

export const SPECIES = ["cat", "dog", "bird"] as const;
export type Species = (typeof SPECIES)[number];

export const SPECIES_INFO: Record<Species, { label: string; noun: string; line: string; fallback: string }> = {
  cat: { label: "Cat", noun: "cat", line: "Sleeps through the traffic. Wakes for kaapi.", fallback: "Billu" },
  dog: { label: "Dog", noun: "dog", line: "Loves a walk. Thinks the darshini is its own.", fallback: "Tommy" },
  bird: { label: "Bird", noun: "bird", line: "Up at dawn, loud on the rail, never still.", fallback: "Chikku" },
};

export const NAME_MAX = 10;
/** The naming keyboard: 26 letters, then Space, Del, Clear and Go (six columns, five rows). */
export const NAME_KEYS: string[] = [..."ABCDEFGHIJKLMNOPQRSTUVWXYZ", "Space", "Del", "Clear", "Go"];

export type Food = "kaapi" | "dosa" | "chaat";
export type FoodOrIdli = Food | "idli";
export type Taste = "favourite" | "okay" | "dislike";
export type WindowId = "kaapi" | "day" | "traffic" | "night";
export type Mood = "idle" | "happy" | "hungry" | "sleepy" | "sad";
export const MOODS: Mood[] = ["idle", "happy", "hungry", "sleepy", "sad"];

export const AREA_INFO: Record<
  Area,
  { favourite: Food; dislike: Food; neutral: Food; window: WindowId; line: string }
> = {
  Malleshwaram: {
    favourite: "kaapi",
    dislike: "chaat",
    neutral: "dosa",
    window: "kaapi",
    line: "Up at six, kaapi by five past. Flower market regular.",
  },
  Jayanagar: {
    favourite: "dosa",
    dislike: "kaapi",
    neutral: "chaat",
    window: "day",
    line: "Park walker and dosa critic. Has opinions about 4th Block.",
  },
  Indiranagar: {
    favourite: "chaat",
    dislike: "dosa",
    neutral: "kaapi",
    window: "traffic",
    line: "Evening person. Chaat on 12th Main, then people-watching.",
  },
};

export const FOOD_NAMES: Record<FoodOrIdli, string> = {
  idli: "Idli (tiffin box)",
  kaapi: "Filter kaapi",
  dosa: "Masala dosa",
  chaat: "Chaat",
};

export const TASTE_TAG: Record<Taste, string> = { favourite: "Favourite", okay: "Okay", dislike: "Not a fan" };

export type DecorId = "tulsi" | "matka" | "rangoli" | "radio" | "bulbs" | "umbrella";
export type DecorItem = { id: DecorId; name: string; slot: "rail" | "floor"; locked: string };

/** Index in this list + 1 is the value packed into a visit code (0 = empty). */
export const DECOR: DecorItem[] = [
  { id: "tulsi", name: "Tulsi pot", slot: "floor", locked: "" },
  { id: "matka", name: "Matka", slot: "floor", locked: "Unlocks on day 2" },
  { id: "rangoli", name: "Rangoli", slot: "floor", locked: "Unlocks after 5 walks" },
  { id: "radio", name: "Radio", slot: "floor", locked: "Unlocks after your first 3-star walk" },
  { id: "bulbs", name: "Bulb string", slot: "rail", locked: "Unlocks on day 7" },
  { id: "umbrella", name: "Umbrella", slot: "rail", locked: "Unlocks with the first rain" },
];

export const SLOT_NAMES = ["Rail", "Left floor", "Right floor"] as const;

export const MOOD_WORD: Record<Mood, string> = {
  idle: "Chilling",
  happy: "Happy",
  hungry: "Hungry",
  sleepy: "Sleepy",
  sad: "Sulking",
};

export const SKY: Record<WindowId, string> = { kaapi: "L", day: "C", traffic: "O", night: "U" };

export const WINDOW_NAMES: Record<WindowId, string> = {
  kaapi: "Kaapi time",
  day: "Daytime",
  traffic: "Traffic time",
  night: "Night",
};

export const ASK_TEXT: Record<WindowId, string> = {
  kaapi: "Kaapi, maga?",
  day: "Sun on the rail?",
  traffic: "Watch the traffic?",
  night: "Bedtime story?",
};

// ---- A. Identity ----
export const TITLE = "Gundu";
export const TAGLINE = "A balcony pal on city time";
export const STICKER = "NAMMA GUNDU";
export const LEDE =
  "A trumpet flower fell on your balcony, and a cat, dog or bird came out of it. Keep it fed, walk it across the junction to the darshini, and send its postcard to a neighbour.";
export const HINT = "Pick an action with the D-pad, press A to do it, and press START for today's card.";
export const HOW_TO_PLAY =
  "Your pet lives on your balcony and follows your clock: kaapi at dawn, traffic at dusk, quiet at night. Choose an action with the D-pad and press A. Walk it to the darshini for its favourite food, then press START for today's card and share it.";

// ---- E. Copy ----
export const ACTIONS = [
  { id: "feed", label: "Feed", aria: "Feed your pet" },
  { id: "bath", label: "Bath", aria: "Give a bath" },
  { id: "walk", label: "Walk", aria: "Take for a walk" },
  { id: "sleep", label: "Sleep", aria: "Put to sleep" },
  { id: "decor", label: "Decor", aria: "Decorate the balcony" },
  { id: "visit", label: "Visit", aria: "Visit a neighbour" },
] as const;
export type ActionId = (typeof ACTIONS)[number]["id"];

export const NEED_LABELS = { hunger: "Belly", fun: "Fun", energy: "Energy", clean: "Clean", today: "Today" } as const;

export const STATUS: Record<string, string> = {
  idle: "{name}'s watching the road. All good, maga.",
  happy: "{name}'s doing a little jig on the rail.",
  hungry: "{name}'s belly is rumbling. Feed it.",
  sleepy: "{name}'s eyes are drooping. Put it to sleep.",
  asleep: "Shh. {name}'s asleep. A to wake it.",
  sadFun: "{name}'s sulking. Take it for a walk or give it a pat.",
  sadClean: "{name}'s feeling grubby. Give it a bath.",
  sadAverage: "{name} needs a bit of everything. Start with food.",
};

export const REACT = {
  favourite: "{name} loves this. Happy belly!",
  okay: "{name} eats it all.",
  dislike: "{name} eats it. Politely.",
  idli: "Two idlis, gone.",
  pat: "{name} leans into your hand.",
  wokeEarly: "{name}'s up, but still yawning.",
} as const;

/** What {name} says after each answered ask, by window. */
export const ASK_LINES = {
  kaapi: "Kaapi shared. {name} perks up.",
  day: "A bit of sun. {name} glows.",
  traffic: "{name} counts the tail-lights. Happy.",
  night: "Once upon a time... {name} is already asleep.",
} as const;

export const MSG = {
  intro1: "A trumpet flower fell on your balcony.",
  intro3: "{name}'s here. It keeps Bengaluru time.",
  whereTitle: "Where's this balcony?",
  noAnswer: "Nothing to answer. {name}'s busy watching the road.",
  homeB: "You're home. SELECT opens the menu.",
  asleepShh: "Shh. {name}'s asleep. Wake it first.",
  beforeInput: "D-PAD PICK · A DO · START CARD",
  pantryEmpty: "Only idli in the tiffin. Take {name} for a walk to bring back more.",
  boxEmpty: "No visitors yet. Share today's card so a neighbour can visit.",
  tooFull: "{name}'s full, maga. Take it for a walk.",
  alreadyClean: "Already shining. Save the water.",
  notSleepy: "{name}'s wide awake. Try a walk first.",
  walkNight: "The darshini's shut. Walks open at 6 am.",
  tooTired: "Too tired to cross. Put {name} to sleep first.",
  askDone: "Done for this part of the day.",
  badCode: "That code doesn't add up. Check the letters, or ask for a fresh card.",
  ownCode: "That's your own pet. Ask a neighbour for theirs.",
  sameCode: "Already visiting today. Try again tomorrow.",
  visitLimit: "Balcony's full. Three visits a day, more tomorrow.",
  giftNoRoom: "No room in the pantry, so the gift went home. Feed {name} first.",
  saveBad: "Couldn't read your pet's save. A new flower fell on the balcony.",
  storageBlocked: "This browser won't keep your pet between visits. Play now, or allow site storage.",
  bathTitle: "Pour three mugs.",
  walkOff: "Walk called off. {name}'s back on the balcony.",
  honk: "Honk! Back to the median.",
  honkKerb: "Honk! Back to the kerb.",
  timeout: "Signal's against you. {name} heads home.",
  pantryFull: "Pantry's full. Feed {name} first, or walk just for fun.",
  welcomeBack: "{name} missed you, maga.",
  slept: "{name} slept well and is up.",
  stillAsleep: "{name}'s still asleep. A to wake it.",
  waited: "{name} waited. It's glad you're back.",
  rainSmell: "Smell that? Wet mud, macha.",
  rainDone: "First rain. {name} won't forget this one.",
  rainLive: "It's raining for the first time. Open the umbrella or let {name} get wet.",
  copied: "Copied. Paste it in WhatsApp or anywhere.",
  oneItem: "One pot so far. More arrive on day 2.",
  renamed: "Now called {name}. Good name, macha.",
  nameHint: "Type a name, then START or Go to keep it.",
} as const;

export const SCREEN_TITLES = {
  today: "Today's card",
  feed: "Feed",
  bath: "Bath time",
  walk: "Walk to the darshini",
  decor: "Decorate",
  visit: "Visit a neighbour",
  box: "Postcard box",
  paused: "Paused",
  species: "Who's come to stay?",
  naming: "Name your pet",
  rename: "Rename",
} as const;
