import type { GameFormat } from "./gameTypes";
import type { GameState } from "./scoring";

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

export function scorePhrase(state: GameState, format: GameFormat): string {
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
