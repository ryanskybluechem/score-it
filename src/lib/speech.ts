import type { GameFormat, PickleballFormat, TennisFormat } from "./gameTypes";
import type {
  GameState,
  PickleballState,
  TennisState,
} from "./scoring";

const NUM = [
  "zero", "one", "two", "three", "four", "five", "six", "seven",
  "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen",
  "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
];

function word(n: number): string {
  if (n < NUM.length) return NUM[n];
  if (n < 30) return `twenty ${NUM[n - 20]}`;
  return String(n);
}

const TENNIS_POINTS = ["love", "fifteen", "thirty", "forty"];

function pickleballPhrase(
  state: PickleballState,
  format: PickleballFormat
): string {
  if (format.scoringType === "rally") {
    return `${word(state.team1Score)}, ${word(state.team2Score)}`;
  }
  const servingScore =
    state.servingTeam === 1 ? state.team1Score : state.team2Score;
  const receivingScore =
    state.servingTeam === 1 ? state.team2Score : state.team1Score;
  if (format.teamSize === 1) {
    return `${word(servingScore)}, ${word(receivingScore)}`;
  }
  return `${word(servingScore)}, ${word(receivingScore)}, ${state.serverNumber}`;
}

function tennisPhrase(state: TennisState, format: TennisFormat): string {
  if (state.inTiebreak) {
    const s = state.servingTeam === 1 ? state.tiebreakT1 : state.tiebreakT2;
    const r = state.servingTeam === 1 ? state.tiebreakT2 : state.tiebreakT1;
    return `${word(s)}, ${word(r)}`;
  }

  const p1 = state.pointsT1;
  const p2 = state.pointsT2;

  if (format.scoring === "ad" && p1 >= 3 && p2 >= 3) {
    if (p1 === p2) return "deuce";
    const adTeam = p1 > p2 ? 1 : 2;
    return state.servingTeam === adTeam ? "advantage in" : "advantage out";
  }

  const sScore = state.servingTeam === 1 ? p1 : p2;
  const rScore = state.servingTeam === 1 ? p2 : p1;
  return `${TENNIS_POINTS[Math.min(sScore, 3)]}, ${TENNIS_POINTS[Math.min(rScore, 3)]}`;
}

export function scorePhrase(state: GameState, format: GameFormat): string {
  if (format.sport === "pickleball" && state.kind === "pickleball") {
    return pickleballPhrase(state, format);
  }
  if (format.sport === "tennis" && state.kind === "tennis") {
    return tennisPhrase(state, format);
  }
  return "";
}

export function speak(text: string) {
  if (typeof window === "undefined") return;
  const synth = window.speechSynthesis;
  if (!synth) return;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1.0;
  u.pitch = 1.0;
  u.volume = 1.0;
  synth.speak(u);
}

export function stopSpeaking() {
  if (typeof window === "undefined") return;
  window.speechSynthesis?.cancel();
}
