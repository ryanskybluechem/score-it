"use client";

import type { PickleballFormat } from "@/lib/gameTypes";
import type { PickleballState } from "@/lib/scoring";

export default function PickleballCourt({
  state,
  format,
  team1Name,
  team2Name,
  onScore,
}: {
  state: PickleballState;
  format: PickleballFormat;
  team1Name: string;
  team2Name: string;
  onScore: (team: 1 | 2) => void;
}) {
  const serving1 = state.servingTeam === 1;
  const serving2 = state.servingTeam === 2;
  const doubles = format.teamSize === 2;
  const isSideout = format.scoringType === "sideout";
  const disabled = state.winner !== null;

  return (
    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:gap-4">
      <TeamPanel
        name={team1Name}
        score={state.team1Score}
        serving={serving1}
        serverNumber={doubles && isSideout && serving1 ? state.serverNumber : undefined}
        winner={state.winner === 1}
        disabled={disabled}
        onTap={() => onScore(1)}
        color="lime"
      />
      <TeamPanel
        name={team2Name}
        score={state.team2Score}
        serving={serving2}
        serverNumber={doubles && isSideout && serving2 ? state.serverNumber : undefined}
        winner={state.winner === 2}
        disabled={disabled}
        onTap={() => onScore(2)}
        color="cyan"
      />
    </div>
  );
}

function TeamPanel({
  name,
  score,
  serving,
  serverNumber,
  winner,
  disabled,
  onTap,
  color,
}: {
  name: string;
  score: number;
  serving: boolean;
  serverNumber?: 1 | 2;
  winner: boolean;
  disabled: boolean;
  onTap: () => void;
  color: "lime" | "cyan";
}) {
  const ringColor = color === "lime" ? "ring-accent" : "ring-cyan-400";
  const accentText = color === "lime" ? "text-accent" : "text-cyan-400";
  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      className={`relative flex flex-1 flex-col items-center justify-center rounded-3xl bg-surface p-6 transition active:scale-[0.99] disabled:opacity-70 ${
        winner ? `ring-2 ${ringColor}` : ""
      }`}
    >
      <div className="flex items-center gap-2 text-lg font-semibold">
        {serving && (
          <span className={`text-xs uppercase tracking-wider ${accentText}`}>
            Serving
          </span>
        )}
        <span>{name}</span>
      </div>
      <div className="mt-4 text-[clamp(6rem,22vw,12rem)] font-bold leading-none tabular-nums">
        {score}
      </div>
      {serverNumber !== undefined && (
        <div className="mt-2 text-sm text-muted">Server {serverNumber}</div>
      )}
      {!disabled && (
        <div className="absolute bottom-4 text-xs text-muted">Tap to score</div>
      )}
    </button>
  );
}
