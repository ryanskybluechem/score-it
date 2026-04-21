import type {
  GameFormat,
  PickleballFormat,
  TennisFormat,
} from "./gameTypes";

export type Team = 1 | 2;

// ------------------------------- Pickleball -------------------------------

export type PickleballState = {
  kind: "pickleball";
  team1Score: number;
  team2Score: number;
  servingTeam: Team;
  serverNumber: 1 | 2;
  firstServiceOfGame: boolean;
  winner: Team | null;
  history: PickleballState[];
};

function initialPickleball(): PickleballState {
  return {
    kind: "pickleball",
    team1Score: 0,
    team2Score: 0,
    servingTeam: 1,
    serverNumber: 1,
    firstServiceOfGame: true,
    winner: null,
    history: [],
  };
}

function checkPickleballWinner(
  s: Pick<PickleballState, "team1Score" | "team2Score">,
  f: PickleballFormat
): Team | null {
  const { team1Score: a, team2Score: b } = s;
  if (a >= f.pointsToWin && a - b >= f.winBy) return 1;
  if (b >= f.pointsToWin && b - a >= f.winBy) return 2;
  return null;
}

function awardPointPickleball(
  state: PickleballState,
  scoringTeam: Team,
  format: PickleballFormat
): PickleballState {
  if (state.winner) return state;
  const snapshot: PickleballState = { ...state, history: [] };
  const history = [...state.history, snapshot];

  if (format.scoringType === "rally") {
    const next: PickleballState = {
      ...state,
      team1Score: scoringTeam === 1 ? state.team1Score + 1 : state.team1Score,
      team2Score: scoringTeam === 2 ? state.team2Score + 1 : state.team2Score,
      servingTeam: scoringTeam,
      serverNumber: 1,
      firstServiceOfGame: false,
      history,
    };
    next.winner = checkPickleballWinner(next, format);
    return next;
  }

  if (scoringTeam === state.servingTeam) {
    const next: PickleballState = {
      ...state,
      team1Score: scoringTeam === 1 ? state.team1Score + 1 : state.team1Score,
      team2Score: scoringTeam === 2 ? state.team2Score + 1 : state.team2Score,
      firstServiceOfGame: false,
      history,
    };
    next.winner = checkPickleballWinner(next, format);
    return next;
  }

  if (format.teamSize === 1) {
    return {
      ...state,
      servingTeam: scoringTeam,
      serverNumber: 1,
      firstServiceOfGame: false,
      history,
    };
  }

  if (state.firstServiceOfGame || state.serverNumber === 2) {
    return {
      ...state,
      servingTeam: scoringTeam,
      serverNumber: 1,
      firstServiceOfGame: false,
      history,
    };
  }

  return { ...state, serverNumber: 2, history };
}

// --------------------------------- Tennis ---------------------------------

export type TennisSet = {
  t1: number;
  t2: number;
  tiebreak?: { t1: number; t2: number };
};

export type TennisState = {
  kind: "tennis";
  pointsT1: number;
  pointsT2: number;
  gamesT1: number;
  gamesT2: number;
  sets: TennisSet[];
  inTiebreak: boolean;
  tiebreakT1: number;
  tiebreakT2: number;
  servingTeam: Team;
  winner: Team | null;
  history: TennisState[];
};

function initialTennis(format: TennisFormat): TennisState {
  return {
    kind: "tennis",
    pointsT1: 0,
    pointsT2: 0,
    gamesT1: 0,
    gamesT2: 0,
    sets: [],
    inTiebreak: format.scoring === "tiebreak-only",
    tiebreakT1: 0,
    tiebreakT2: 0,
    servingTeam: 1,
    winner: null,
    history: [],
  };
}

function setsWonBy(sets: TennisSet[], team: Team): number {
  return sets.filter((s) => (team === 1 ? s.t1 > s.t2 : s.t2 > s.t1)).length;
}

function awardPointTennis(
  state: TennisState,
  scoringTeam: Team,
  format: TennisFormat
): TennisState {
  if (state.winner) return state;
  const snapshot: TennisState = { ...state, history: [] };
  const history = [...state.history, snapshot];

  // ---- Tiebreak ----
  if (state.inTiebreak) {
    const t1 = state.tiebreakT1 + (scoringTeam === 1 ? 1 : 0);
    const t2 = state.tiebreakT2 + (scoringTeam === 2 ? 1 : 0);
    const target = format.tiebreakPoints;

    const tbWon =
      (t1 >= target && t1 - t2 >= 2) || (t2 >= target && t2 - t1 >= 2);

    if (!tbWon) {
      // Serve switches every 2 points in a tiebreak (after first point).
      const totalPoints = t1 + t2;
      const server = totalPoints % 4 === 1 || totalPoints % 4 === 2
        ? state.servingTeam === 1 ? 2 : 1
        : state.servingTeam;
      return {
        ...state,
        tiebreakT1: t1,
        tiebreakT2: t2,
        servingTeam: server,
        history,
      };
    }

    const tbWinner: Team = t1 > t2 ? 1 : 2;

    if (format.scoring === "tiebreak-only") {
      return {
        ...state,
        tiebreakT1: t1,
        tiebreakT2: t2,
        winner: tbWinner,
        history,
      };
    }

    const gamesT1 = state.gamesT1 + (tbWinner === 1 ? 1 : 0);
    const gamesT2 = state.gamesT2 + (tbWinner === 2 ? 1 : 0);
    const newSets: TennisSet[] = [
      ...state.sets,
      { t1: gamesT1, t2: gamesT2, tiebreak: { t1, t2 } },
    ];

    const setsToWin = Math.ceil(format.bestOfSets / 2);
    const matchWinner: Team | null =
      setsWonBy(newSets, 1) >= setsToWin
        ? 1
        : setsWonBy(newSets, 2) >= setsToWin
        ? 2
        : null;

    return {
      ...state,
      pointsT1: 0,
      pointsT2: 0,
      gamesT1: 0,
      gamesT2: 0,
      sets: newSets,
      inTiebreak: false,
      tiebreakT1: 0,
      tiebreakT2: 0,
      servingTeam: state.servingTeam === 1 ? 2 : 1,
      winner: matchWinner,
      history,
    };
  }

  // ---- Regular point ----
  const p1 = state.pointsT1 + (scoringTeam === 1 ? 1 : 0);
  const p2 = state.pointsT2 + (scoringTeam === 2 ? 1 : 0);

  let gameWinner: Team | null = null;
  if (format.scoring === "ad") {
    if (p1 >= 4 && p1 - p2 >= 2) gameWinner = 1;
    else if (p2 >= 4 && p2 - p1 >= 2) gameWinner = 2;
  } else {
    // no-ad: sudden death at 3-3
    if (p1 >= 4 && p2 <= 3) gameWinner = 1;
    else if (p2 >= 4 && p1 <= 3) gameWinner = 2;
  }

  if (!gameWinner) {
    return { ...state, pointsT1: p1, pointsT2: p2, history };
  }

  // Game won — increment, reset points, swap server.
  const gT1 = state.gamesT1 + (gameWinner === 1 ? 1 : 0);
  const gT2 = state.gamesT2 + (gameWinner === 2 ? 1 : 0);
  const newServer: Team = state.servingTeam === 1 ? 2 : 1;

  // Tiebreak trigger
  if (gT1 === format.tiebreakAt && gT2 === format.tiebreakAt) {
    return {
      ...state,
      pointsT1: 0,
      pointsT2: 0,
      gamesT1: gT1,
      gamesT2: gT2,
      inTiebreak: true,
      tiebreakT1: 0,
      tiebreakT2: 0,
      servingTeam: newServer,
      history,
    };
  }

  // Set win check
  let setWinner: Team | null = null;
  if (gT1 >= format.gamesPerSet && gT1 - gT2 >= 2) setWinner = 1;
  else if (gT2 >= format.gamesPerSet && gT2 - gT1 >= 2) setWinner = 2;

  if (!setWinner) {
    return {
      ...state,
      pointsT1: 0,
      pointsT2: 0,
      gamesT1: gT1,
      gamesT2: gT2,
      servingTeam: newServer,
      history,
    };
  }

  const newSets: TennisSet[] = [...state.sets, { t1: gT1, t2: gT2 }];
  const setsToWin = Math.ceil(format.bestOfSets / 2);
  const matchWinner: Team | null =
    setsWonBy(newSets, 1) >= setsToWin
      ? 1
      : setsWonBy(newSets, 2) >= setsToWin
      ? 2
      : null;

  return {
    ...state,
    pointsT1: 0,
    pointsT2: 0,
    gamesT1: 0,
    gamesT2: 0,
    sets: newSets,
    servingTeam: newServer,
    winner: matchWinner,
    history,
  };
}

// --------------------------------- Public ---------------------------------

export type GameState = PickleballState | TennisState;

export function initialState(format: GameFormat): GameState {
  return format.sport === "pickleball"
    ? initialPickleball()
    : initialTennis(format);
}

export function awardPoint(
  state: GameState,
  team: Team,
  format: GameFormat
): GameState {
  if (format.sport === "pickleball" && state.kind === "pickleball") {
    return awardPointPickleball(state, team, format);
  }
  if (format.sport === "tennis" && state.kind === "tennis") {
    return awardPointTennis(state, team, format);
  }
  return state;
}

export function undo(state: GameState): GameState {
  if (state.history.length === 0) return state;
  const prev = state.history[state.history.length - 1];
  if (state.kind === "pickleball" && prev.kind === "pickleball") {
    return { ...prev, history: state.history.slice(0, -1) };
  }
  if (state.kind === "tennis" && prev.kind === "tennis") {
    return { ...prev, history: state.history.slice(0, -1) };
  }
  return state;
}
