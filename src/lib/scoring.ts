import type { GameFormat } from "./gameTypes";

export type Team = 1 | 2;

export type GameState = {
  team1Score: number;
  team2Score: number;
  servingTeam: Team;
  serverNumber: 1 | 2;
  firstServiceOfGame: boolean;
  winner: Team | null;
  history: GameState[];
};

export function initialState(): GameState {
  return {
    team1Score: 0,
    team2Score: 0,
    servingTeam: 1,
    serverNumber: 1,
    firstServiceOfGame: true,
    winner: null,
    history: [],
  };
}

function checkWinner(
  s: Pick<GameState, "team1Score" | "team2Score">,
  f: GameFormat
): Team | null {
  const { team1Score: a, team2Score: b } = s;
  const need = f.pointsToWin;
  const by = f.winBy;
  if (a >= need && a - b >= by) return 1;
  if (b >= need && b - a >= by) return 2;
  return null;
}

export function awardPoint(
  state: GameState,
  scoringTeam: Team,
  format: GameFormat
): GameState {
  if (state.winner) return state;

  const snapshot: GameState = { ...state, history: [] };
  const history = [...state.history, snapshot];

  if (format.scoringType === "rally") {
    const next: GameState = {
      ...state,
      team1Score: scoringTeam === 1 ? state.team1Score + 1 : state.team1Score,
      team2Score: scoringTeam === 2 ? state.team2Score + 1 : state.team2Score,
      servingTeam: scoringTeam,
      serverNumber: 1,
      firstServiceOfGame: false,
      history,
    };
    next.winner = checkWinner(next, format);
    return next;
  }

  // Side-out scoring
  if (scoringTeam === state.servingTeam) {
    const next: GameState = {
      ...state,
      team1Score: scoringTeam === 1 ? state.team1Score + 1 : state.team1Score,
      team2Score: scoringTeam === 2 ? state.team2Score + 1 : state.team2Score,
      firstServiceOfGame: false,
      history,
    };
    next.winner = checkWinner(next, format);
    return next;
  }

  // Receiving team won the rally → server change or side-out
  if (format.teamSize === 1) {
    return {
      ...state,
      servingTeam: scoringTeam,
      serverNumber: 1,
      firstServiceOfGame: false,
      history,
    };
  }

  // Doubles: first service of the game is a single-server start, then side-out
  if (state.firstServiceOfGame || state.serverNumber === 2) {
    return {
      ...state,
      servingTeam: scoringTeam,
      serverNumber: 1,
      firstServiceOfGame: false,
      history,
    };
  }

  return {
    ...state,
    serverNumber: 2,
    history,
  };
}

export function undo(state: GameState): GameState {
  if (state.history.length === 0) return state;
  const prev = state.history[state.history.length - 1];
  return { ...prev, history: state.history.slice(0, -1) };
}

export function formatScore(state: GameState, format: GameFormat): string {
  if (format.scoringType === "rally") {
    return `${state.team1Score} – ${state.team2Score}`;
  }
  const servingScore =
    state.servingTeam === 1 ? state.team1Score : state.team2Score;
  const receivingScore =
    state.servingTeam === 1 ? state.team2Score : state.team1Score;
  if (format.teamSize === 1) return `${servingScore} – ${receivingScore}`;
  return `${servingScore} – ${receivingScore} – ${state.serverNumber}`;
}
