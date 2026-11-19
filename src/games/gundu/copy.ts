import { ASK_LINES, MSG, NAME_MAX, REACT, SPECIES_INFO, STATUS, type Species } from "./data";

/** Fill the {name} token. The name is only letters and spaces, so a function replacement keeps it literal. */
export const fill = (text: string, name: string) => text.replaceAll("{name}", () => name);

const filled = (table: Record<string, string>, name: string): Record<string, string> =>
  Object.fromEntries(Object.entries(table).map(([k, v]) => [k, fill(v, name)]));

/** Every line that names the pet, with the name in place. */
export function copyFor(name: string) {
  return {
    name,
    MSG: filled(MSG, name),
    STATUS: filled(STATUS, name),
    REACT: filled(REACT, name),
    ASK_LINES: filled(ASK_LINES, name),
  };
}

export type Copy = ReturnType<typeof copyFor>;

/** Trim and cap a typed name. An empty name falls back to the species' default. */
export function cleanName(raw: string, species: Species): string {
  const n = raw.replace(/\s+/g, " ").trim().slice(0, NAME_MAX).trim();
  return n || SPECIES_INFO[species].fallback;
}
