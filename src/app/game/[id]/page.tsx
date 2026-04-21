import Scoreboard from "./Scoreboard";

export default async function GamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Scoreboard gameId={id} />;
}
