"use client";

import type { TennisFormat } from "@/lib/gameTypes";
import type { TennisState } from "@/lib/scoring";

function pointLabel(
  p1: number,
  p2: number,
  me: 1 | 2,
  scoring: TennisFormat["scoring"]
): string {
  if (scoring === "ad" && p1 >= 3 && p2 >= 3) {
    if (p1 === p2) return "40";
    const adTeam = p1 > p2 ? 1 : 2;
    return adTeam === me ? "Ad" : "40";
  }
  const mine = me === 1 ? p1 : p2;
  return ["0", "15", "30", "40"][Math.min(mine, 3)];
}

export default function TennisCourt({
  state,
  format,
  team1Name,
  team2Name,
  onScore,
}: {
  state: TennisState;
  format: TennisFormat;
  team1Name: string;
  team2Name: string;
  onScore: (team: 1 | 2) => void;
}) {
  const disabled = state.winner !== null;
  const tiebreakOnly = format.scoring === "tiebreak-only";

  return (
    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:gap-4">
      <Side
        me={1}
        other={2}
        state={state}
        format={format}
        name={team1Name}
        disabled={disabled}
        winner={state.winner === 1}
        tiebreakOnly={tiebreakOnly}
        onTap={() => onScore(1)}
        color="lime"
      />
      <Side
        me={2}
        other={1}
        state={state}
        format={format}
        name={team2Name}
        disabled={disabled}
        winner={state.winner === 2}
        tiebreakOnly={tiebreakOnly}
        onTap={() => onScore(2)}
        color="cyan"
      />
    </div>
  );
}

function Side({
  me,
  state,
  format,
  name,
  disabled,
  winner,
  tiebreakOnly,
  onTap,
  color,
}: {
  me: 1 | 2;
  other: 1 | 2;
  state: TennisState;
  format: TennisFormat;
  name: string;
  disabled: boolean;
  winner: boolean;
  tiebreakOnly: boolean;
  onTap: () => void;
  color: "lime" | "cyan";
}) {
  const ringColor = color === "lime" ? "ring-accent" : "ring-cyan-400";
  const accentText = color === "lime" ? "text-accent" : "text-cyan-400";
  const serving = state.servingTeam === me;

  const myCurrentGames = me === 1 ? state.gamesT1 : state.gamesT2;
  const myPointDisplay = state.inTiebreak
    ? String(me === 1 ? state.tiebreakT1 : state.tiebreakT2)
    : pointLabel(state.pointsT1, state.pointsT2, me, format.scoring);

  const mySets = state.sets.map((s) => (me === 1 ? s.t1 : s.t2));

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      className={`relative flex flex-1 flex-col items-center justify-start rounded-3xl bg-surface p-6 pt-5 transition active:scale-[0.99] disabled:opacity-70 ${
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

      {!tiebreakOnly && (
        <div className="mt-3 flex min-h-[24px] items-center gap-2 text-sm text-muted">
          {mySets.length === 0 && state.gamesT1 === 0 && state.gamesT2 === 0 ? (
            <span className="opacity-60">—</span>
          ) : (
            <>
              {mySets.map((g, i) => {
                const opp = me === 1 ? state.sets[i].t2 : state.sets[i].t1;
                const wonSet = g > opp;
                return (
                  <span
                    key={i}
                    className={`tabular-nums ${
                      wonSet ? "font-semibold text-foreground" : ""
                    }`}
                  >
                    {g}
                  </span>
                );
              })}
              <span className="mx-1 opacity-40">•</span>
              <span className="font-semibold tabular-nums text-foreground">
                {myCurrentGames}
              </span>
            </>
          )}
        </div>
      )}

      <div className="mt-3 text-[clamp(5rem,20vw,10rem)] font-bold leading-none tabular-nums">
        {myPointDisplay}
      </div>

      {state.inTiebreak && !tiebreakOnly && (
        <div className="mt-2 text-xs uppercase tracking-wider text-muted">
          Tiebreak
        </div>
      )}

      {!disabled && (
        <div className="absolute bottom-4 text-xs text-muted">Tap to score</div>
      )}
    </button>
  );
}
