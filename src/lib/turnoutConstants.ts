export const HOURS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
] as const;

export type HourSlot = typeof HOURS[number];

export const KSG_TEAMS = [
  { key: "privreda", label: "Привреда", path: "/izlaznost/ksg/privreda" },
  { key: "koalicija", label: "Коалиција", path: "/izlaznost/ksg/koalicija" },
  { key: "opstina", label: "Општина", path: "/izlaznost/ksg/opstina" },
  { key: "republika", label: "Република", path: "/izlaznost/ksg/republika" },
  { key: "odbori", label: "Одбори", path: "/izlaznost/ksg/odbori" },
] as const;

export type KsgTeamKey = typeof KSG_TEAMS[number]["key"];

export interface TurnoutOrganization {
  id: number;
  name: string;
  target: number;
  team_type: string;
}

export interface TurnoutEntry {
  id: number;
  source_type: string;
  source_id: number | null;
  hour: string;
  count: number;
  entry_date: string;
}
