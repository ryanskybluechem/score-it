export type ScoringType = "sideout" | "rally";

export type GameFormat = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  scoringType: ScoringType;
  teamSize: 1 | 2;
  pointsToWin: number;
  winBy: number;
  cap?: number;
};

export const GAME_FORMATS: GameFormat[] = [
  {
    id: "trad-doubles",
    name: "Traditional Doubles",
    tagline: "Rec & league standard",
    description:
      "Side-out scoring. First to 11, win by 2. Two servers per side. Classic pickleball.",
    scoringType: "sideout",
    teamSize: 2,
    pointsToWin: 11,
    winBy: 2,
  },
  {
    id: "trad-singles",
    name: "Traditional Singles",
    tagline: "1v1, side-out",
    description: "Side-out scoring. First to 11, win by 2. One server per side.",
    scoringType: "sideout",
    teamSize: 1,
    pointsToWin: 11,
    winBy: 2,
  },
  {
    id: "tournament-15",
    name: "Tournament to 15",
    tagline: "Medal matches",
    description: "Side-out doubles. First to 15, win by 2. Used in many medal rounds.",
    scoringType: "sideout",
    teamSize: 2,
    pointsToWin: 15,
    winBy: 2,
  },
  {
    id: "tournament-21",
    name: "Tournament to 21",
    tagline: "Longer tournament format",
    description: "Side-out doubles. First to 21, win by 2.",
    scoringType: "sideout",
    teamSize: 2,
    pointsToWin: 21,
    winBy: 2,
  },
  {
    id: "rally-11",
    name: "Rally to 11",
    tagline: "Fast & simple",
    description: "Every rally scores. First to 11, win by 2. Great for quick games.",
    scoringType: "rally",
    teamSize: 2,
    pointsToWin: 11,
    winBy: 2,
  },
  {
    id: "rally-15",
    name: "Rally to 15",
    tagline: "PPA pro format",
    description: "Every rally scores. First to 15, win by 2. Used on the PPA Tour.",
    scoringType: "rally",
    teamSize: 2,
    pointsToWin: 15,
    winBy: 2,
  },
  {
    id: "rally-21",
    name: "Rally to 21",
    tagline: "Long match",
    description: "Every rally scores. First to 21, win by 2.",
    scoringType: "rally",
    teamSize: 2,
    pointsToWin: 21,
    winBy: 2,
  },
  {
    id: "skinny-singles",
    name: "Skinny Singles",
    tagline: "Half court drill",
    description:
      "Cross-court only, side-out scoring. First to 11, win by 2. A classic training game.",
    scoringType: "sideout",
    teamSize: 1,
    pointsToWin: 11,
    winBy: 2,
  },
];

export function getFormat(id: string): GameFormat | undefined {
  return GAME_FORMATS.find((f) => f.id === id);
}
