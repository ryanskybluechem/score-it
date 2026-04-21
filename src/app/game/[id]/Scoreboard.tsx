"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getFormat } from "@/lib/gameTypes";
import {
  awardPoint,
  type GameState,
  initialState,
  undo as undoState,
} from "@/lib/scoring";
import { scorePhrase, speak, stopSpeaking } from "@/lib/speech";

const ANNOUNCE_KEY = "scoreit:announce";

type Stored = {
  formatId: string;
  team1Name: string;
  team2Name: string;
  state: GameState;
  createdAt: number;
};

const storageKey = (id: string) => `scoreit:game:${id}`;

export default function Scoreboard({ gameId }: { gameId: string }) {
  const [data, setData] = useState<Stored | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [announce, setAnnounce] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(gameId));
      if (raw) setData(JSON.parse(raw));
      setAnnounce(localStorage.getItem(ANNOUNCE_KEY) === "1");
    } catch {}
    setLoaded(true);
    return () => stopSpeaking();
  }, [gameId]);

  const toggleAnnounce = useCallback(() => {
    setAnnounce((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(ANNOUNCE_KEY, next ? "1" : "0");
      } catch {}
      if (next) speak("Announcements on");
      else stopSpeaking();
      return next;
    });
  }, []);

  const format = useMemo(
    () => (data ? getFormat(data.formatId) : undefined),
    [data]
  );

  const persist = useCallback(
    (next: Stored) => {
      setData(next);
      try {
        localStorage.setItem(storageKey(gameId), JSON.stringify(next));
      } catch {}
    },
    [gameId]
  );

  const onScore = useCallback(
    (team: 1 | 2) => {
      if (!data || !format) return;
      const nextState = awardPoint(data.state, team, format);
      persist({ ...data, state: nextState });
      if (announce) {
        if (nextState.winner) {
          const winnerName =
            nextState.winner === 1 ? data.team1Name : data.team2Name;
          speak(`Game. ${winnerName} wins.`);
        } else {
          speak(scorePhrase(nextState, format));
        }
      }
    },
    [data, format, persist, announce]
  );

  const onUndo = useCallback(() => {
    if (!data) return;
    persist({ ...data, state: undoState(data.state) });
  }, [data, persist]);

  const onReset = useCallback(() => {
    if (!data) return;
    persist({ ...data, state: initialState() });
  }, [data, persist]);

  if (!loaded) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted">
        Loading…
      </div>
    );
  }

  if (!data || !format) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 text-center">
        <p className="text-xl font-semibold">Game not found</p>
        <p className="mt-2 text-muted">
          This scoreboard lives only in the browser that started it. Start a
          fresh one to continue.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-xl bg-accent px-5 py-3 font-semibold text-background"
        >
          Start a new game
        </Link>
      </div>
    );
  }

  const { state, team1Name, team2Name } = data;
  const serving1 = state.servingTeam === 1;
  const serving2 = state.servingTeam === 2;
  const doubles = format.teamSize === 2;
  const isSideout = format.scoringType === "sideout";

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-2 text-sm text-muted">
          <span aria-hidden>←</span> Home
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleAnnounce}
            aria-pressed={announce}
            aria-label={announce ? "Mute announcements" : "Announce scores"}
            className={`flex h-10 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition ${
              announce
                ? "border-accent bg-accent/15 text-accent"
                : "border-white/10 bg-surface text-muted"
            }`}
          >
            <span aria-hidden>{announce ? "🔊" : "🔇"}</span>
            <span>{announce ? "Announce" : "Muted"}</span>
          </button>
          <div className="text-right">
            <div className="text-sm font-semibold">{format.name}</div>
            <div className="text-xs text-muted">
              First to {format.pointsToWin}, win by {format.winBy}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-3 px-3 pb-4 sm:flex-row sm:gap-4 sm:px-6">
        <TeamPanel
          name={team1Name}
          score={state.team1Score}
          serving={serving1}
          serverNumber={doubles && isSideout && serving1 ? state.serverNumber : undefined}
          winner={state.winner === 1}
          disabled={state.winner !== null}
          onTap={() => onScore(1)}
          color="lime"
        />
        <TeamPanel
          name={team2Name}
          score={state.team2Score}
          serving={serving2}
          serverNumber={doubles && isSideout && serving2 ? state.serverNumber : undefined}
          winner={state.winner === 2}
          disabled={state.winner !== null}
          onTap={() => onScore(2)}
          color="cyan"
        />
      </div>

      {state.winner && (
        <div className="mx-3 mb-3 rounded-2xl bg-accent/15 px-5 py-4 text-center sm:mx-6">
          <div className="text-sm uppercase tracking-wider text-accent">
            Game
          </div>
          <div className="mt-1 text-xl font-bold">
            {state.winner === 1 ? team1Name : team2Name} wins{" "}
            {Math.max(state.team1Score, state.team2Score)}–
            {Math.min(state.team1Score, state.team2Score)}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 px-3 pb-5 sm:px-6">
        <button
          type="button"
          onClick={onUndo}
          disabled={state.history.length === 0}
          className="h-12 rounded-xl border border-white/10 bg-surface text-sm font-semibold disabled:opacity-40"
        >
          Undo
        </button>
        <button
          type="button"
          onClick={onReset}
          className="h-12 rounded-xl border border-white/10 bg-surface text-sm font-semibold"
        >
          Reset
        </button>
        <Link
          href="/"
          className="flex h-12 items-center justify-center rounded-xl bg-accent text-sm font-semibold text-background"
        >
          New game
        </Link>
      </div>
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
        {serving && <span className={`text-xs uppercase tracking-wider ${accentText}`}>Serving</span>}
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
