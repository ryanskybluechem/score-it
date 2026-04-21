"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getFormat } from "@/lib/gameTypes";
import {
  awardPoint,
  type GameState,
  initialState,
  type TennisState,
  undo as undoState,
} from "@/lib/scoring";
import { scorePhrase, speak, stopSpeaking } from "@/lib/speech";
import PickleballCourt from "./PickleballCourt";
import TennisCourt from "./TennisCourt";

type Stored = {
  formatId: string;
  team1Name: string;
  team2Name: string;
  state: GameState;
  createdAt: number;
};

const storageKey = (id: string) => `scoreit:game:${id}`;
const ANNOUNCE_KEY = "scoreit:announce";

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

  const format = useMemo(
    () => (data ? getFormat(data.formatId) : undefined),
    [data]
  );

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
          const verb = format.sport === "tennis" ? "Game, set, and match." : "Game.";
          speak(`${verb} ${winnerName} wins.`);
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
    if (!data || !format) return;
    persist({ ...data, state: initialState(format) });
  }, [data, format, persist]);

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

  // Guard against stored states that don't match the current format (shouldn't
  // normally happen, but keeps types safe).
  const mismatch =
    (format.sport === "pickleball" && state.kind !== "pickleball") ||
    (format.sport === "tennis" && state.kind !== "tennis");

  const formatMeta =
    format.sport === "pickleball"
      ? `First to ${format.pointsToWin}, win by ${format.winBy}`
      : format.scoring === "tiebreak-only"
      ? `First to ${format.tiebreakPoints}, win by 2`
      : `Best of ${format.bestOfSets} set${format.bestOfSets === 1 ? "" : "s"}`;

  const winnerSummary = state.winner
    ? summariseWinner(state, format, team1Name, team2Name)
    : null;

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
            <div className="text-xs text-muted">{formatMeta}</div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-3 pb-4 sm:px-6">
        {mismatch ? (
          <div className="flex flex-1 items-center justify-center text-muted">
            Stored game doesn&apos;t match this format. Reset to start over.
          </div>
        ) : format.sport === "pickleball" && state.kind === "pickleball" ? (
          <PickleballCourt
            state={state}
            format={format}
            team1Name={team1Name}
            team2Name={team2Name}
            onScore={onScore}
          />
        ) : format.sport === "tennis" && state.kind === "tennis" ? (
          <TennisCourt
            state={state}
            format={format}
            team1Name={team1Name}
            team2Name={team2Name}
            onScore={onScore}
          />
        ) : null}
      </div>

      {winnerSummary && (
        <div className="mx-3 mb-3 rounded-2xl bg-accent/15 px-5 py-4 text-center sm:mx-6">
          <div className="text-sm uppercase tracking-wider text-accent">
            {format.sport === "tennis" ? "Game, set, match" : "Game"}
          </div>
          <div className="mt-1 text-xl font-bold">{winnerSummary}</div>
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

function summariseWinner(
  state: GameState,
  format: ReturnType<typeof getFormat> & object,
  team1Name: string,
  team2Name: string
): string {
  if (!state.winner) return "";
  const winnerName = state.winner === 1 ? team1Name : team2Name;

  if (state.kind === "pickleball") {
    const hi = Math.max(state.team1Score, state.team2Score);
    const lo = Math.min(state.team1Score, state.team2Score);
    return `${winnerName} wins ${hi}–${lo}`;
  }

  const ts = state as TennisState;
  if (format && "scoring" in format && format.scoring === "tiebreak-only") {
    const hi = Math.max(ts.tiebreakT1, ts.tiebreakT2);
    const lo = Math.min(ts.tiebreakT1, ts.tiebreakT2);
    return `${winnerName} wins ${hi}–${lo}`;
  }
  const setStr = ts.sets
    .map((s) => (state.winner === 1 ? `${s.t1}–${s.t2}` : `${s.t2}–${s.t1}`))
    .join(", ");
  return `${winnerName} wins ${setStr}`;
}
