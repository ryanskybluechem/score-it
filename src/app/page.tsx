import NewGameForm from "./NewGameForm";
import { GAME_FORMATS } from "@/lib/gameTypes";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center px-5 py-10 sm:py-16">
      <div className="w-full max-w-3xl">
        <header className="mb-10 sm:mb-14">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-accent" />
            <h1 className="text-2xl font-bold tracking-tight">Score It</h1>
          </div>
          <p className="mt-4 text-lg text-muted">
            The fastest way to score a pickleball game. Every format built in.
          </p>
        </header>

        <NewGameForm formats={GAME_FORMATS} />

        <footer className="mt-16 text-sm text-muted">
          Pickleball today. More sports soon.
        </footer>
      </div>
    </div>
  );
}
