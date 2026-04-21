"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GameFormat } from "@/lib/gameTypes";

function makeId() {
  const alpha = "abcdefghjkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += alpha[Math.floor(Math.random() * alpha.length)];
  }
  return id;
}

export default function NewGameForm({ formats }: { formats: GameFormat[] }) {
  const [formatId, setFormatId] = useState(formats[0].id);
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const router = useRouter();

  const format = useMemo(
    () => formats.find((f) => f.id === formatId) ?? formats[0],
    [formats, formatId]
  );

  function start() {
    const id = makeId();
    const payload = {
      formatId: format.id,
      team1Name: team1.trim() || (format.teamSize === 1 ? "Player 1" : "Team 1"),
      team2Name: team2.trim() || (format.teamSize === 1 ? "Player 2" : "Team 2"),
      state: {
        team1Score: 0,
        team2Score: 0,
        servingTeam: 1,
        serverNumber: 1,
        firstServiceOfGame: true,
        winner: null,
        history: [],
      },
      createdAt: Date.now(),
    };
    try {
      localStorage.setItem(`scoreit:game:${id}`, JSON.stringify(payload));
    } catch {}
    router.push(`/game/${id}`);
  }

  const singles = format.teamSize === 1;

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Pick a format
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {formats.map((f) => {
            const selected = f.id === formatId;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFormatId(f.id)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-accent bg-accent/10"
                    : "border-white/10 bg-surface hover:border-white/20 hover:bg-surface-2"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-semibold">{f.name}</span>
                  <span className="text-xs text-muted">{f.tagline}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{f.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          {singles ? "Players" : "Teams"}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={team1}
            onChange={(e) => setTeam1(e.target.value)}
            placeholder={singles ? "Player 1 (optional)" : "Team 1 (optional)"}
            className="h-12 rounded-xl border border-white/10 bg-surface px-4 text-base outline-none focus:border-accent"
          />
          <input
            value={team2}
            onChange={(e) => setTeam2(e.target.value)}
            placeholder={singles ? "Player 2 (optional)" : "Team 2 (optional)"}
            className="h-12 rounded-xl border border-white/10 bg-surface px-4 text-base outline-none focus:border-accent"
          />
        </div>
      </section>

      <button
        type="button"
        onClick={start}
        className="h-14 rounded-2xl bg-accent text-lg font-bold text-background transition hover:bg-accent-dark active:scale-[0.99]"
      >
        Start game
      </button>
    </div>
  );
}
