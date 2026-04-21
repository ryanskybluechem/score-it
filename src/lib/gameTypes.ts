export type Sport = "pickleball" | "tennis";

export type PickleballFormat = {
  id: string;
  sport: "pickleball";
  name: string;
  tagline: string;
  description: string;
  scoringType: "sideout" | "rally";
  teamSize: 1 | 2;
  pointsToWin: number;
  winBy: number;
};

export type TennisFormat = {
  id: string;
  sport: "tennis";
  name: string;
  tagline: string;
  description: string;
  scoring: "ad" | "no-ad" | "tiebreak-only";
  gamesPerSet: number;
  tiebreakAt: number;
  tiebreakPoints: number;
  bestOfSets: number;
};

export type GameFormat = PickleballFormat | TennisFormat;

export const GAME_FORMATS: GameFormat[] = [
  // Pickleball
  {
    id: "trad-doubles",
    sport: "pickleball",
    name: "Traditional Doubles",
    tagline: "Rec & league standard",
    description:
      "Side-out scoring. First to 11, win by 2. Two servers per side.",
    scoringType: "sideout",
    teamSize: 2,
    pointsToWin: 11,
    winBy: 2,
  },
  {
    id: "trad-singles",
    sport: "pickleball",
    name: "Traditional Singles",
    tagline: "1v1, side-out",
    description: "Side-out scoring. First to 11, win by 2.",
    scoringType: "sideout",
    teamSize: 1,
    pointsToWin: 11,
    winBy: 2,
  },
  {
    id: "tournament-15",
    sport: "pickleball",
    name: "Tournament to 15",
    tagline: "Medal matches",
    description: "Side-out doubles. First to 15, win by 2.",
    scoringType: "sideout",
    teamSize: 2,
    pointsToWin: 15,
    winBy: 2,
  },
  {
    id: "tournament-21",
    sport: "pickleball",
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
    sport: "pickleball",
    name: "Rally to 11",
    tagline: "Fast & simple",
    description: "Every rally scores. First to 11, win by 2.",
    scoringType: "rally",
    teamSize: 2,
    pointsToWin: 11,
    winBy: 2,
  },
  {
    id: "rally-15",
    sport: "pickleball",
    name: "Rally to 15",
    tagline: "PPA pro format",
    description: "Every rally scores. First to 15, win by 2.",
    scoringType: "rally",
    teamSize: 2,
    pointsToWin: 15,
    winBy: 2,
  },
  {
    id: "rally-21",
    sport: "pickleball",
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
    sport: "pickleball",
    name: "Skinny Singles",
    tagline: "Half court drill",
    description: "Cross-court only, side-out. First to 11, win by 2.",
    scoringType: "sideout",
    teamSize: 1,
    pointsToWin: 11,
    winBy: 2,
  },
  // Tennis
  {
    id: "tennis-bo3-ad",
    sport: "tennis",
    name: "Best of 3 Sets",
    tagline: "Standard match",
    description:
      "Ad scoring. Sets to 6, win by 2. Tiebreak at 6-6 (first to 7, win by 2).",
    scoring: "ad",
    gamesPerSet: 6,
    tiebreakAt: 6,
    tiebreakPoints: 7,
    bestOfSets: 3,
  },
  {
    id: "tennis-bo3-noad",
    sport: "tennis",
    name: "Best of 3 — No-Ad",
    tagline: "Faster club format",
    description:
      "No-ad scoring (sudden death at 40-40). Sets to 6. Tiebreak at 6-6.",
    scoring: "no-ad",
    gamesPerSet: 6,
    tiebreakAt: 6,
    tiebreakPoints: 7,
    bestOfSets: 3,
  },
  {
    id: "tennis-bo5-ad",
    sport: "tennis",
    name: "Best of 5 Sets",
    tagline: "Grand Slam style",
    description: "Ad scoring. First to 3 sets. Tiebreak at 6-6.",
    scoring: "ad",
    gamesPerSet: 6,
    tiebreakAt: 6,
    tiebreakPoints: 7,
    bestOfSets: 5,
  },
  {
    id: "tennis-single-set",
    sport: "tennis",
    name: "Single Set",
    tagline: "One-set shootout",
    description: "Ad scoring. First to 6 games, tiebreak at 6-6.",
    scoring: "ad",
    gamesPerSet: 6,
    tiebreakAt: 6,
    tiebreakPoints: 7,
    bestOfSets: 1,
  },
  {
    id: "tennis-proset8",
    sport: "tennis",
    name: "Pro Set to 8",
    tagline: "One long set",
    description: "Ad scoring. First to 8 games, win by 2. Tiebreak at 8-8.",
    scoring: "ad",
    gamesPerSet: 8,
    tiebreakAt: 8,
    tiebreakPoints: 7,
    bestOfSets: 1,
  },
  {
    id: "tennis-fast4",
    sport: "tennis",
    name: "Fast4",
    tagline: "Quick format",
    description:
      "Best of 3 short sets. No-ad, first to 4 games, tiebreak at 3-3.",
    scoring: "no-ad",
    gamesPerSet: 4,
    tiebreakAt: 3,
    tiebreakPoints: 5,
    bestOfSets: 3,
  },
  {
    id: "tennis-mtb10",
    sport: "tennis",
    name: "10-Point Match Tiebreak",
    tagline: "3rd-set replacement",
    description: "First to 10, win by 2. Used in lieu of a deciding set.",
    scoring: "tiebreak-only",
    gamesPerSet: 0,
    tiebreakAt: 0,
    tiebreakPoints: 10,
    bestOfSets: 1,
  },
];

export function getFormat(id: string): GameFormat | undefined {
  return GAME_FORMATS.find((f) => f.id === id);
}
