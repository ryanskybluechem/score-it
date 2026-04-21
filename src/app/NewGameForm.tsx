"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GameFormat, Sport } from "@/lib/gameTypes";
import { initialState } from "@/lib/scoring";

function makeId() {
  const alpha = "abcdefghjkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += alpha[Math.floor(Math.random() * alpha.length)];
  }
  return id;
}

const SPORT_LABEL: Record<Sport, string> = {
  pickleball: "Pickleball",
  tennis: "Tennis",
};

export default function NewGameForm({ formats }: { formats: GameFormat[] }) {
  const sports = useMemo(() => {
    const seen = new Set<Sport>();
    const ordered: Sport[] = [];
    for (const f of formats) {
      if (!seen.has(f.sport)) {
        seen.add(f.sport);
        ordered.push(f.sport);
      }
    }
    return ordered;
  }, [formats]);

  const [sport, setSport] = useState<Sport>(sports[0]);
  const visibleFormats = useMemo(
    () => formats.filter((f) => f.sport === sport),
    [formats, sport]
  );

  const [formatId, setFormatId] = useState(visibleFormats[0].id);
  const [team1, setTeam1] = useState("");
  const [team2, setTeam2] = useState("");
  const router = useRouter();

  const activeFormatId = visibleFormats.some((f) => f.id === formatId)
    ? formatId
    : visibleFormats[0].id;
  const format = visibleFormats.find((f) => f.id === activeFormatId)!;

  const singles = format.sport === "pickleball" ? format.teamSize === 1 : true;
  const isTennis = format.sport === "tennis";
  const personLabel = isTennis ? "Player" : singles ? "Player" : "Team";

  function start() {
    const id = makeId();
    const payload = {
      formatId: format.id,
      team1Name: team1.trim() || `${personLabel} 1`,
      team2Name: team2.trim() || `${personLabel} 2`,
      state: initialState(format),
      createdAt: Date.now(),
    };
    try {
      localStorage.setItem(`scoreit:game:${id}`, JSON.stringify(payload));
    } catch {}
    router.push(`/game/${id}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Sport
        </h2>
        <div className="flex gap-2">
          {sports.map((s) => {
            const active = s === sport;
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  setSport(s);
                  const first = formats.find((f) => f.sport === s);
                  if (first) setFormatId(first.id);
                }}
                className={`rounded-full border px-5 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-accent bg-accent text-background"
                    : "border-white/10 bg-surface text-foreground hover:bg-surface-2"
                }`}
              >
                {SPORT_LABEL[s]}
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted">
          Pick a format
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {visibleFormats.map((f) => {
            const selected = f.id === activeFormatId;
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
          {isTennis || singles ? "Players" : "Teams"}
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            value={team1}
            onChange={(e) => setTeam1(e.target.value)}
            placeholder={`${personLabel} 1 (optional)`}
            className="h-12 rounded-xl border border-white/10 bg-surface px-4 text-base outline-none focus:border-accent"
          />
          <input
            value={team2}
            onChange={(e) => setTeam2(e.target.value)}
            placeholder={`${personLabel} 2 (optional)`}
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
