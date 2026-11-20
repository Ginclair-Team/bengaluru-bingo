import type { Sprite } from "@/lib/pixel";

/**
 * Gig Hunt art. One idea carries the cartridge: the PG room wall is the job
 * board. Today's three listings are salmon sticky notes pinned above the
 * laptop, and everything else (tiffin, kaapi, key, offer letter) lives on that
 * desk. Outline K, one W highlight top-left, one darker shade right/bottom.
 */

// Cartridge menu icon: a salmon sticky note with a red push pin, a face and
// one scribbled line, bottom-right corner folded up.
export const ICON: Sprite = [
  ".......KK.......",
  "......KRRK......",
  "......KRMK......",
  "..KKKKKKKKKKKK..",
  "..KWPPPPPPPPMK..",
  "..KPPPPPPPPPMK..",
  "..KPPPKPPKPPMK..",
  "..KPPPPPPPPPMK..",
  "..KPPPPKKPPPMK..",
  "..KPPPPPPPPPMK..",
  "..KPKKKKKKPPMK..",
  "..KPPPPPPPPPMK..",
  "..KPPPPPPPPKKK..",
  "..KPPPPPPPPKCK..",
  "..KMMMMMMMMKK...",
  "................",
];

/** Track icons, 16 x 16 (listing detail, learn track). Web is orange, mobile plum, data teal. */
export const TRACK: Record<"web" | "mobile" | "data", Sprite> = {
  // Web: a browser window with an orange title bar and </> on the page.
  web: [
    "................",
    ".KKKKKKKKKKKKKK.",
    ".KWOOOOOOOOOORK.",
    ".KKKKKKKKKKKKKK.",
    ".KCCCCCCCCCCCNK.",
    ".KCCCKCCCKKCCNK.",
    ".KCCKCCCKCCKCNK.",
    ".KCKCCCCKCCCKNK.",
    ".KCCKCCKCCCKCNK.",
    ".KCCCKKCCCKCCNK.",
    ".KCCCCCCCCCCCNK.",
    ".KNNNNNNNNNNNNK.",
    ".KKKKKKKKKKKKKK.",
    "................",
    "................",
    "................",
  ],
  // Mobile: a plum phone, upright, app rows on a cream screen, home button.
  mobile: [
    "................",
    "...KKKKKKKKKK...",
    "...KWVVVVVVVK...",
    "...KVKKKKKKVK...",
    "...KVKWCCCKVK...",
    "...KVKCSSCKVK...",
    "...KVKCCCCKVK...",
    "...KVKCSSCKVK...",
    "...KVKCCCCKVK...",
    "...KVKKKKKKVK...",
    "...KVVVKKVVVK...",
    "...KVVVVVVVVK...",
    "...KKKKKKKKKK...",
    "................",
    "................",
    "................",
  ],
  // Data: three teal bars rising left to right on a baseline.
  data: [
    "................",
    "................",
    "...........KKKK.",
    "...........KWDK.",
    "...........KTDK.",
    "......KKKK.KTDK.",
    "......KWDK.KTDK.",
    "......KTDK.KTDK.",
    ".KKKK.KTDK.KTDK.",
    ".KWDK.KTDK.KTDK.",
    ".KTDK.KTDK.KTDK.",
    ".KTDK.KTDK.KTDK.",
    ".KTDK.KTDK.KTDK.",
    ".KKKKKKKKKKKKKK.",
    "................",
    "................",
  ],
};

/** Track glyphs, 8 x 8, one colour (draw with mono). Day screen skill line, beside the WEB / MOB / DATA labels. */
export const TRACK_MINI: Record<"web" | "mobile" | "data", Sprite> = {
  // Web: angle brackets.
  web: [
    "........",
    "..K..K..",
    ".KK..KK.",
    "KK....KK",
    ".KK..KK.",
    "..K..K..",
    "........",
    "........",
  ],
  // Mobile: a phone outline with a home button.
  mobile: [
    ".KKKKKK.",
    ".K....K.",
    ".K....K.",
    ".K....K.",
    ".K....K.",
    ".KKKKKK.",
    ".KK..KK.",
    ".KKKKKK.",
  ],
  // Data: three bars.
  data: [
    "......KK",
    "......KK",
    "...KK.KK",
    "...KK.KK",
    "KK.KK.KK",
    "KK.KK.KK",
    "KK.KK.KK",
    "KKKKKKKK",
  ],
};

// Steel tiffin carrier: handle, lid, three tiers, face on the middle tier.
export const TIFFIN: Sprite = [
  "......KKKK......",
  ".....KK..KK.....",
  ".....K....K.....",
  "..KKKKKKKKKKKK..",
  "..KWSSSSSSSSHK..",
  "..KKKKKKKKKKKK..",
  "..KSSSSSSSSSHK..",
  "..KSSKSSSSKSHK..",
  "..KSSSSKKSSSHK..",
  "..KKKKKKKKKKKK..",
  "..KSSSSSSSSSHK..",
  "..KSSSSSSSSSHK..",
  "..KKKKKKKKKKKK..",
  "...KHHHHHHHHK...",
  "...KKKKKKKKKK...",
  "................",
];

// Laptop: dark bezel, cream screen with a face, steel base with a trackpad.
export const LAPTOP: Sprite = [
  "................",
  "..KKKKKKKKKKKK..",
  "..KHHHHHHHHHHK..",
  "..KHWCCCCCCCHK..",
  "..KHCCCCCCCCHK..",
  "..KHCCKCCKCCHK..",
  "..KHCCCCCCCCHK..",
  "..KHCCCKKCCCHK..",
  "..KHCCCCCCCCHK..",
  "..KHHHHHHHHHHK..",
  ".KKKKKKKKKKKKKK.",
  ".KWSSSSSSSSSSHK.",
  ".KSSSSHHHHSSSHK.",
  ".KKKKKKKKKKKKKK.",
  "................",
  "................",
];

// Rupee coin, 8 x 8: turmeric coin, K bar with a leg (the rupee mark, simplified).
export const COIN: Sprite = [
  "..KKKK..",
  ".KWYYOK.",
  "KYKKKKOK",
  "KYYKKYOK",
  "KYYYKYOK",
  "KYYYYKOK",
  ".KOOOOK.",
  "..KKKK..",
];

// Offer letter: salmon envelope, cream flap, deep-salmon wax seal under the flap tip.
export const OFFER: Sprite = [
  "................",
  "................",
  ".KKKKKKKKKKKKKK.",
  ".KKWCCCCCCCCCKK.",
  ".KPKCCCCCCCCKMK.",
  ".KPPKCCCCCCKPMK.",
  ".KPPPKCCCCKPPMK.",
  ".KPPPPKCCKPPPMK.",
  ".KPPPPPKKPPPPMK.",
  ".KPPPPKWMKPPPMK.",
  ".KPPPPKMMKPPPMK.",
  ".KPPPPPKKPPPPMK.",
  ".KMMMMMMMMMMMMK.",
  ".KKKKKKKKKKKKKK.",
  "................",
  "................",
];

// Rejected slip, 8 x 8: a crumpled warm-grey paper ball. Grey, never red.
export const SLIP: Sprite = [
  "..KK.KK.",
  ".KWSKSSK",
  "KSSSSKHK",
  "KSKSSSHK",
  ".KSSKSHK",
  "KSSSSSHK",
  ".KHSHHK.",
  "..KKKKK.",
];

// PG room key, 8 x 8: brass bow with a hole, shaft to the right, two teeth. Rent notice.
export const KEY: Sprite = [
  ".KKK....",
  "KWYOK...",
  "KY.OKKKK",
  "KYOOOOOK",
  ".KKKOKOK",
  "...KOKOK",
  "...KKKKK",
  "........",
];

/**
 * Day screen centrepiece, 64 x 44. A PG room corner: tube light, a window with
 * an iron grille (sun, a low block, a rain tree, a tower), kaapi on the sill
 * side, the laptop with a face in the middle, the steel tiffin on the right,
 * and three salmon sticky notes on the wall, one per listing on today's board.
 *
 * Sticky notes (9 x 9 boxes, outline included), left to right = listing rows 1 to 3:
 *   note 1: x 30..38, y 6..14   pin at x 33..35, y 4..6
 *   note 2: x 41..49, y 7..15   pin at x 44..46, y 5..7
 *   note 3: x 52..60, y 5..13   pin at x 55..57, y 3..5
 * To mark a listing tried today, repaint inside its box: P -> S, M -> H
 * (W highlight and K stay). The cursor brackets on the Day screen wrap the note
 * of the selected listing row.
 */
export const SCENE: Sprite = [
  "CCCCCCCCCCCCCCCCCCCCCCCCCCKKKKKKKKKKKKKKKKKKKKKKKKKCCCCCCCCCCCCC",
  "CCCCCCCCCCCCCCCCCCCCCCCCCCKWWWWWWWWWWWWWWWWWWWWWWSKCCCCCCCCCCCCC",
  "CCCKKKKKKKKKKKKKKKKKKKKKKCKKKKKKKKKKKKKKKKKKKKKKKKKCCCCCCCCCCCCC",
  "CCCKNNNNNNNNNNNNNNNNNNNNKCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCKKKCCCCCC",
  "CCCKNLLKKLLKLLLLLKLLLLLNKCCCCCCCCKKKCCCCCCCCCCCCCCCCCCCKRKCCCCCC",
  "CCCKNLKYYKLKLLLLLKLLLLLNKCCCCCCCCKRKCCCCCCCCKKKCCCCCKKKKRKKKKCCC",
  "CCCKNKYWYYKKLLLLLKLLLLLNKCCCCCKKKKRKKKKCCCCCKRKCCCCCKWPPPPPMKCCC",
  "CCCKNKYYOOKKLLLLLKLLLLLNKCCCCCKWPPPPPMKCCKKKKRKKKKCCKPPPPPPMKCCC",
  "CCCKNLKYYKLKLLLLLKKKKKKNKCCCCCKPPPPPPMKCCKWPPPPPMKCCKPMMMMPMKCCC",
  "CCCKNLLKKLLKLLLLLKKSHHKNKCCCCCKPMMMMPMKCCKPPPPPPMKCCKPPPPPPMKCCC",
  "CCCKNLLLLLLKLLLLLKKSYHKNKCCCCCKPPPPPPMKCCKPMMMMPMKCCKPMMMPPMKCCC",
  "CCCKNLLLLLLKLLLLLKKSHHKNKCCCCCKPMMMPPMKCCKPPPPPPMKCCKPPPPPPMKCCC",
  "CCCKNLLLLLLKLKKKLKKSYHKNKCCCCCKPPPPPPMKCCKPMMMPPMKCCKMMMMMMMKCCC",
  "CCCKNLLLLLLKKWGDKKKSHHKNKCCCCCKMMMMMMMKCCKPPPPPPMKCCKKKKKKKKKCCC",
  "CCCKNLLLLLLKKGGDKKKSYHKNKCCCCCKKKKKKKKKCCKMMMMMMMKCCCCCCCCCCCCCC",
  "CCCKNKKKKKKKKGGDKKKSHHKNKCCCCCCCCCCCCCCCCKKKKKKKKKCCCCCCCCCCCCCC",
  "CCCKNKSSSHKKKGGDKKKSYHKNKCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
  "CCCKNKSYSHKKLKNKLKKSHHKNKCKKKKKKKKKKKKKKKKCCCCCCCCCCCCCCCCCCCCCC",
  "CCCKNKSSSHKKLKNKLKKSYHKNKCKHHHHHHHHHHHHHHKCCCCCCCCCCCKKKKCCCCCCC",
  "CCCKNKSYSHKKLKNKLKKSHHKNKCKHWCCCCCCCCCCCHKCCCCCCCCCCKCCCCKCCCCCC",
  "CCCKNKSSSHKKLKNKLKKSHHKNKCKHCCCKKCCKKCCCHKCCCCCCCCCCKCCCCKCCCCCC",
  "CCCKNNNNNNNNNNNNNNNNNNNNKCKHCCCKKCCKKCCCHKCCCCCCCCKKKKKKKKKKCCCC",
  "CCCKKKKKKKKKKKKKKKKKKKKKKCKHCCPCCCCCCPCCHKCCCCCCCCKWSSSSSSHKCCCC",
  "CCKWEEEEEEEEEEEEEEEEEEEEEKKHCCCCCKKCCCCCHKCCCCCCCCKKKKKKKKKKCCCC",
  "CCKKKKKKKKKKKKKKKKKKKKKKKKKHCCCCCCCCCCCCHKCCCCCCCCKSSKSSKSHKCCCC",
  "CCCCCCCCCCWCWCCCCCCCCCCCCCKHCCCCCCCCCCCCHKCCCCCCCCKSSSKKSSHKCCCC",
  "CCCCCCCCCCCWCWCCCCCCCCCCCCKHHHHHHHHHHHHHHKCCCCCCCCKKKKKKKKKKCCCC",
  "CCCCCCCCCKKKKKCCCCCCCCCCKKKKKKKKKKKKKKKKKKKKCCCCCCKSSSSSSSHKCCCC",
  "CCCCCCCCCKWSHKCCCCCCCCCCKWSSSSSSSSSSSSSSSSHKCCCCCCKSSSSSSSHKCCCC",
  "CCCCCCCCCKWSHKCCCCCCCCCCKSSSSSSHHHHHHSSSSSHKCCCCCCKKKKKKKKKKCCCC",
  "CCCCCCCKSSSSSSHKCCCCCCCCKKKKKKKKKKKKKKKKKKKKCCCCCCKHHHHHHHHKCCCC",
  "EEEEEEEEKKKKKKKEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEKKKKKKKKEEEEE",
  "NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN",
  "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
  "NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN",
  "NNNNKKKKKKKKKKKKKKKKKKKKKNNNNNNNNNNNNNNKKKKKKKKKKKKKKKKKKKKKNNNN",
  "NNNNKEEEEEEEEEEEEEEEEEEEKNNNNNNNNNNNNNNKEEEEEEEEEEEEEEEEEEEKNNNN",
  "NNNNKNNNNNNNNNNNNNNNNNNNKNNNNNNNNNNNNNNKNNNNNNNNNNNNNNNNNNNKNNNN",
  "NNNNKNNNNNNNKYYYKNNNNNNNKNNNNNNNNNNNNNNKNNNNNNNKYYYKNNNNNNNKNNNN",
  "NNNNKNNNNNNNNNNNNNNNNNNNKNNNNNNNNNNNNNNKNNNNNNNNNNNNNNNNNNNKNNNN",
  "NNNNKNNNNNNNNNNNNNNNNNNNKNNNNNNNNNNNNNNKNNNNNNNNNNNNNNNNNNNKNNNN",
  "NNNNKKKKKKKKKKKKKKKKKKKKKNNNNNNNNNNNNNNKKKKKKKKKKKKKKKKKKKKKNNNN",
  "NNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN",
  "KKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK",
];

// Listing row marker, 8 x 8: an open sticky note (Day screen, left of each listing row).
export const NOTE: Sprite = [
  "KKKKKKKK",
  "KWPPPPMK",
  "KPMMMPMK",
  "KPPPPPMK",
  "KPMMPPMK",
  "KPPPPKKK",
  "KMMMMKCK",
  "KKKKKKK.",
];

// Listing row marker, 8 x 8: a note already tried today, gone grey (row also reads DONE).
export const NOTE_DONE: Sprite = [
  "KKKKKKKK",
  "KWSSSSHK",
  "KSHHHSHK",
  "KSSSSSHK",
  "KSHHSSHK",
  "KSSSSKKK",
  "KHHHHKCK",
  "KKKKKKK.",
];

// Energy glyph, 8 x 8, one colour: a lightning bolt (Day screen, before the ENERGY number).
export const BOLT: Sprite = [
  "....KK..",
  "...KK...",
  "..KK....",
  ".KKKKK..",
  "...KK...",
  "..KK....",
  ".KK.....",
  "........",
];

/** Action glyphs, 8 x 8, one colour (Day screen action row, each beside its text label). */
export const ACTION: Record<"learn" | "tiffin" | "freelance" | "sleep", Sprite> = {
  // Learn: an open book.
  learn: [
    ".KK..KK.",
    "K..KK..K",
    "K..KK..K",
    "K..KK..K",
    "K..KK..K",
    "KKKKKKKK",
    "........",
    "........",
  ],
  // Tiffin: a stacked carrier with a handle.
  tiffin: [
    "..KKKK..",
    "..K..K..",
    "KKKKKKKK",
    "K......K",
    "KKKKKKKK",
    "K......K",
    "KKKKKKKK",
    ".KKKKKK.",
  ],
  // Freelance: a small laptop.
  freelance: [
    "........",
    ".KKKKKK.",
    ".K....K.",
    ".K....K.",
    ".KKKKKK.",
    "KKKKKKKK",
    "KKKKKKKK",
    "........",
  ],
  // Sleep: a crescent moon and a small z.
  sleep: [
    "...KK...",
    ".KK.....",
    "KK...KKK",
    "KK....K.",
    "KK...KKK",
    ".KK.....",
    "...KK...",
    "........",
  ],
};
