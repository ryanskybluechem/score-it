"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { TennisFormat } from "@/lib/gameTypes";
import type { TennisState } from "@/lib/scoring";
import TennisCourtSvg from "./courts/TennisCourtSvg";
import Confetti from "./courts/Confetti";

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

function teamScoreSignature(state: TennisState, team: 1 | 2): string {
  // Any state change in this team's favour should trigger a bump animation.
  // We include points, current games, and completed sets count so all three
  // kinds of progress animate.
  const p = team === 1 ? state.pointsT1 : state.pointsT2;
  const g = team === 1 ? state.gamesT1 : state.gamesT2;
  const tb = team === 1 ? state.tiebreakT1 : state.tiebreakT2;
  const setsWon = state.sets.filter((s) =>
    team === 1 ? s.t1 > s.t2 : s.t2 > s.t1
  ).length;
  return `${p}-${g}-${tb}-${setsWon}`;
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

  const totalPoints = state.inTiebreak
    ? state.tiebreakT1 + state.tiebreakT2
    : state.pointsT1 + state.pointsT2;
  const serverSide: "deuce" | "ad" = totalPoints % 2 === 0 ? "deuce" : "ad";

  // Track scoring events.
  const sig1 = teamScoreSignature(state, 1);
  const sig2 = teamScoreSignature(state, 2);
  const prev = useRef({ sig1, sig2 });
  const [pulse, setPulse] = useState<{ team: 1 | 2; key: number } | null>(null);

  useEffect(() => {
    if (prev.current.sig1 !== sig1 && !didRegress(prev.current.sig1, sig1)) {
      setPulse({ team: 1, key: Date.now() });
    } else if (
      prev.current.sig2 !== sig2 &&
      !didRegress(prev.current.sig2, sig2)
    ) {
      setPulse({ team: 2, key: Date.now() });
    }
    prev.current = { sig1, sig2 };
  }, [sig1, sig2]);

  return (
    <div className="relative flex flex-1 overflow-hidden rounded-3xl bg-surface">
      {/* Court */}
      <div className="absolute inset-0">
        <TennisCourtSvg
          highlightTop={state.servingTeam === 2}
          highlightBottom={state.servingTeam === 1}
          serverHalf={
            disabled
              ? null
              : { side: serverSide, team: state.servingTeam }
          }
          pulse={pulse}
        />
      </div>

      {/* Top team (team 2) */}
      <TennisOverlay
        position="top"
        name={team2Name}
        pointText={
          state.inTiebreak
            ? String(state.tiebreakT2)
            : pointLabel(state.pointsT1, state.pointsT2, 2, format.scoring)
        }
        serving={state.servingTeam === 2}
        inTiebreak={state.inTiebreak}
        showBoard={!tiebreakOnly}
        sets={state.sets.map((s) => ({ mine: s.t2, theirs: s.t1 }))}
        currentGames={state.gamesT2}
        bumpKey={sig2}
        winner={state.winner === 2}
        disabled={disabled}
        onTap={() => onScore(2)}
      />

      {/* Bottom team (team 1) */}
      <TennisOverlay
        position="bottom"
        name={team1Name}
        pointText={
          state.inTiebreak
            ? String(state.tiebreakT1)
            : pointLabel(state.pointsT1, state.pointsT2, 1, format.scoring)
        }
        serving={state.servingTeam === 1}
        inTiebreak={state.inTiebreak}
        showBoard={!tiebreakOnly}
        sets={state.sets.map((s) => ({ mine: s.t1, theirs: s.t2 }))}
        currentGames={state.gamesT1}
        bumpKey={sig1}
        winner={state.winner === 1}
        disabled={disabled}
        onTap={() => onScore(1)}
      />

      <AnimatePresence>
        {state.winner && <Confetti team={state.winner} />}
      </AnimatePresence>
    </div>
  );
}

// Very rough "did this change shrink?" check so an undo doesn't trigger a pulse.
function didRegress(prev: string, next: string): boolean {
  const a = prev.split("-").map(Number);
  const b = next.split("-").map(Number);
  for (let i = 0; i < a.length; i++) {
    if (b[i] < a[i]) return true;
  }
  return false;
}

function TennisOverlay({
  position,
  name,
  pointText,
  serving,
  inTiebreak,
  showBoard,
  sets,
  currentGames,
  bumpKey,
  winner,
  disabled,
  onTap,
}: {
  position: "top" | "bottom";
  name: string;
  pointText: string;
  serving: boolean;
  inTiebreak: boolean;
  showBoard: boolean;
  sets: Array<{ mine: number; theirs: number }>;
  currentGames: number;
  bumpKey: string;
  winner: boolean;
  disabled: boolean;
  onTap: () => void;
}) {
  const isTop = position === "top";

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      className={`absolute inset-x-0 ${isTop ? "top-0" : "bottom-0"} flex h-1/2 flex-col items-center px-5 ${
        isTop ? "pt-4 justify-start" : "pb-4 justify-end"
      } ${winner ? "z-10" : ""} disabled:opacity-95`}
    >
      {isTop && (
        <Header
          name={name}
          serving={serving}
          inTiebreak={inTiebreak}
          showBoard={showBoard}
          sets={sets}
          currentGames={currentGames}
        />
      )}

      <motion.div
        key={bumpKey}
        initial={{ scale: 0.55, opacity: 0.2 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 20 }}
        className={`${isTop ? "mt-3" : "mb-3"} text-[clamp(4.5rem,20vw,10rem)] font-bold leading-none tabular-nums text-foreground drop-shadow-[0_4px_12px_rgba(0,0,0,0.55)]`}
      >
        {pointText}
      </motion.div>

      {!isTop && (
        <Header
          name={name}
          serving={serving}
          inTiebreak={inTiebreak}
          showBoard={showBoard}
          sets={sets}
          currentGames={currentGames}
        />
      )}

      {!disabled && (
        <div className="mt-2 text-[10px] uppercase tracking-widest text-white/40">
          Tap to score
        </div>
      )}
    </button>
  );
}

function Header({
  name,
  serving,
  inTiebreak,
  showBoard,
  sets,
  currentGames,
}: {
  name: string;
  serving: boolean;
  inTiebreak: boolean;
  showBoard: boolean;
  sets: Array<{ mine: number; theirs: number }>;
  currentGames: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center gap-2 text-base font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
        {serving && (
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
            {inTiebreak ? "Serving · TB" : "Serving"}
          </span>
        )}
        <span className="text-foreground">{name}</span>
      </div>
      {showBoard && (
        <div className="flex items-center gap-1.5 text-xs text-muted">
          {sets.map((s, i) => (
            <span
              key={i}
              className={`rounded px-1.5 py-0.5 tabular-nums ${
                s.mine > s.theirs
                  ? "bg-accent/25 font-semibold text-foreground"
                  : "bg-white/5"
              }`}
            >
              {s.mine}
            </span>
          ))}
          <span
            className={`rounded px-1.5 py-0.5 tabular-nums ${
              sets.length > 0 ? "bg-white/10" : "bg-white/5"
            } font-semibold text-foreground`}
          >
            {currentGames}
          </span>
        </div>
      )}
    </div>
  );
}
