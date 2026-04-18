export interface Card {
  id: string;
  name: string;
  type: string;
  power: number;
  pp: number;
  energyCost: 1 | 2 | 3;
  description: string;
  damageClass: "physical" | "special" | "status";
  temporary?: boolean;
  typeless?: boolean;
}

export const createStruggleCard = (): Card => ({
  id: "165",
  name: "Struggle",
  type: "normal",
  power: 50,
  pp: 1,
  energyCost: 1,
  description: "",
  damageClass: "physical",
  typeless: true,
});
