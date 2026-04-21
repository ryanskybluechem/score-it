"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { PickleballFormat } from "@/lib/gameTypes";
import type { PickleballState } from "@/lib/scoring";
import PickleballCourtSvg, { type ServerBox } from "./courts/PickleballCourtSvg";
import Confetti from "./courts/Confetti";

function serverBoxFor(
  state: PickleballState,
  format: PickleballFormat
): ServerBox {
  if (format.scoringType !== "sideout") return null;
  const servingScore =
    state.servingTeam === 1 ? state.team1Score : state.team2Score;
  const even = servingScore % 2 === 0;
  if (state.servingTeam === 1) {
    // Bottom team — their deuce (right) court is viewer's right half.
    return { x: even ? 100 : 0, y: 290, w: 100, h: 148 };
  }
  // Top team — their deuce (right) is viewer's left half.
  return { x: even ? 0 : 100, y: 2, w: 100, h: 148 };
}

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
  const serverBox = serverBoxFor(state, format);

  // Track last-scored team for pulse + score bump.
  const prev = useRef({ t1: state.team1Score, t2: state.team2Score });
  const [pulse, setPulse] = useState<{ team: 1 | 2; key: number } | null>(null);
  const [bump, setBump] = useState<{ team: 1 | 2; key: number } | null>(null);

  useEffect(() => {
    if (state.team1Score > prev.current.t1) {
      const key = Date.now();
      setPulse({ team: 1, key });
      setBump({ team: 1, key });
    } else if (state.team2Score > prev.current.t2) {
      const key = Date.now();
      setPulse({ team: 2, key });
      setBump({ team: 2, key });
    }
    prev.current = { t1: state.team1Score, t2: state.team2Score };
  }, [state.team1Score, state.team2Score]);

  return (
    <div className="relative flex flex-1 overflow-hidden rounded-3xl bg-surface">
      {/* Court background */}
      <div className="absolute inset-0">
        <PickleballCourtSvg
          highlightTop={serving2}
          highlightBottom={serving1}
          serverBox={serverBox}
          pulse={pulse}
        />
      </div>

      {/* Top team (team 2) */}
      <TeamOverlay
        position="top"
        name={team2Name}
        score={state.team2Score}
        serving={serving2}
        serverNumber={
          doubles && isSideout && serving2 ? state.serverNumber : undefined
        }
        bump={bump?.team === 2 ? bump.key : null}
        winner={state.winner === 2}
        disabled={disabled}
        onTap={() => onScore(2)}
      />

      {/* Bottom team (team 1) */}
      <TeamOverlay
        position="bottom"
        name={team1Name}
        score={state.team1Score}
        serving={serving1}
        serverNumber={
          doubles && isSideout && serving1 ? state.serverNumber : undefined
        }
        bump={bump?.team === 1 ? bump.key : null}
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

function TeamOverlay({
  position,
  name,
  score,
  serving,
  serverNumber,
  bump,
  winner,
  disabled,
  onTap,
}: {
  position: "top" | "bottom";
  name: string;
  score: number;
  serving: boolean;
  serverNumber?: 1 | 2;
  bump: number | null;
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
      className={`absolute inset-x-0 ${isTop ? "top-0" : "bottom-0"} flex h-1/2 flex-col items-center justify-center px-6 ${
        isTop ? "pt-5" : "pb-5"
      } ${winner ? "z-10" : ""} disabled:opacity-95`}
      style={{ flexDirection: isTop ? "column" : "column-reverse" }}
    >
      <div className="flex items-center gap-2 text-base font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
        {serving && (
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
            Serving
          </span>
        )}
        <span className="text-foreground">{name}</span>
      </div>
      <motion.div
        key={bump ?? "stable"}
        initial={bump ? { scale: 0.6, opacity: 0.2 } : false}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 18 }}
        className="my-2 text-[clamp(5rem,22vw,11rem)] font-bold leading-none tabular-nums text-foreground drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      >
        {score}
      </motion.div>
      {serverNumber !== undefined && (
        <div className="text-xs font-semibold text-muted">
          Server {serverNumber}
        </div>
      )}
      {!disabled && (
        <div className="text-[10px] uppercase tracking-widest text-white/40">
          Tap to score
        </div>
      )}
    </button>
  );
}
