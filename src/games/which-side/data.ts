import { LANDMARK_SPRITES } from "./sprites";
import type { Sprite } from "@/lib/pixel";

export const ZONES = ["CENTRAL", "NORTH", "EAST", "SOUTH", "WEST"] as const;
export type Zone = (typeof ZONES)[number];

/** Evening travel-time bands from MG Road, shortest first. */
export const BANDS = ["UNDER 20", "20-45 MIN", "45-90 MIN", "90+ MIN"] as const;
export type Band = (typeof BANDS)[number];

export type Landmark = {
  id: string;
  label: string;
  zone: Zone;
  band: Band;
  fact: string;
  sprite: Sprite;
};

type Row = Omit<Landmark, "sprite">;

const ROWS: Row[] = [
  { id: "vidhana-soudha", label: "VIDHANA SOUDHA", zone: "CENTRAL", band: "UNDER 20", fact: "Seat of Karnataka's legislature, completed in 1956." },
  { id: "cubbon-park", label: "CUBBON PARK", zone: "CENTRAL", band: "UNDER 20", fact: "Laid out in 1870; officially Sri Chamarajendra Park." },
  { id: "koshys", label: "KOSHY'S", zone: "CENTRAL", band: "UNDER 20", fact: "A St Mark's Road institution, serving since 1940." },
  { id: "freedom-park", label: "FREEDOM PARK", zone: "CENTRAL", band: "UNDER 20", fact: "Built on the old Central Jail; opened as a park in 2008." },
  { id: "ulsoor-lake", label: "ULSOOR LAKE", zone: "CENTRAL", band: "20-45 MIN", fact: "Dotted with islands; credited to Kempe Gowda II." },
  { id: "bangalore-palace", label: "PALACE", zone: "CENTRAL", band: "20-45 MIN", fact: "Tudor-style palace, said to echo Windsor Castle." },
  { id: "malleshwaram", label: "MALLESHWARAM", zone: "NORTH", band: "45-90 MIN", fact: "Laid out in 1898 as a new suburb after a plague outbreak." },
  { id: "hebbal-flyover", label: "HEBBAL", zone: "NORTH", band: "45-90 MIN", fact: "Hebbal's looping flyover carries the road to the airport." },
  { id: "manyata", label: "MANYATA", zone: "NORTH", band: "45-90 MIN", fact: "Manyata Tech Park in Nagawara is among India's largest." },
  { id: "airport", label: "AIRPORT", zone: "NORTH", band: "90+ MIN", fact: "Kempegowda International opened at Devanahalli in 2008." },
  { id: "lalbagh", label: "LALBAGH", zone: "SOUTH", band: "20-45 MIN", fact: "Begun by Hyder Ali; its Glass House echoes Crystal Palace." },
  { id: "bull-temple", label: "BULL TEMPLE", zone: "SOUTH", band: "20-45 MIN", fact: "Its monolithic Nandi gave Basavanagudi its name." },
  { id: "vv-puram", label: "VV PURAM", zone: "SOUTH", band: "20-45 MIN", fact: "Named after Sir M. Visvesvaraya; famed for its food street." },
  { id: "silk-board", label: "SILK BOARD", zone: "SOUTH", band: "45-90 MIN", fact: "Named after the Central Silk Board office at the junction." },
  { id: "ragigudda", label: "RAGIGUDDA", zone: "SOUTH", band: "20-45 MIN", fact: "Anjaneya temple on a rocky hillock in J.P. Nagar." },
  { id: "indiranagar", label: "100 FT ROAD", zone: "EAST", band: "45-90 MIN", fact: "Indiranagar's spine, lined with pubs, cafes and shops." },
  { id: "marathahalli", label: "MARATHAHALLI", zone: "EAST", band: "45-90 MIN", fact: "Where Old Airport Road meets the Outer Ring Road." },
  { id: "whitefield", label: "WHITEFIELD", zone: "EAST", band: "90+ MIN", fact: "Began in the 1880s as an Anglo-Indian settlement." },
  { id: "iskcon", label: "ISKCON", zone: "WEST", band: "20-45 MIN", fact: "On Hare Krishna Hill in Rajajinagar; opened in 1997." },
  { id: "tipu-palace", label: "TIPU'S PALACE", zone: "WEST", band: "20-45 MIN", fact: "Tipu Sultan's teak summer palace, finished in 1791." },
];

export const LANDMARKS: Landmark[] = ROWS.map((row) => ({ ...row, sprite: LANDMARK_SPRITES[row.id] }));

