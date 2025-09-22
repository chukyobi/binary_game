import { useEffect, useState } from "react";
import { useGameStore } from "../stores/gameStore";
import AnswerObstacle from "./AnswerObstacle";

interface SpawnedObstacle {
  id: string;
  option: string;
  lane: number;
  z: number;
}

export default function Obstacles() {
  const currentQuestion = useGameStore((s) => s.currentQuestion);
  const [spawned, setSpawned] = useState<SpawnedObstacle[]>([]);

  // TODO: replace with actual character Z from your player store
  const playerZ = 0;

  useEffect(() => {
    if (!currentQuestion) return;

    let isActive = true;

    const spawnNext = () => {
      if (!isActive) return;

      // pick random option
      const option =
        currentQuestion.options[
          Math.floor(Math.random() * currentQuestion.options.length)
        ];

      // pick random lane (-1, 0, +1)
      const lane = Math.floor(Math.random() * 3) - 1;

      setSpawned((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          option,
          lane,
          z: playerZ - 20, // spawn 20 units ahead of player
        },
      ]);

      // schedule next spawn
      const nextDelay = 1000 + Math.random() * 2000; // 1–3 sec
      setTimeout(spawnNext, nextDelay);
    };

    spawnNext();

    return () => {
      isActive = false;
      setSpawned([]);
    };
  }, [currentQuestion, playerZ]);

  if (!currentQuestion) return null;

  return (
    <>
      {spawned.map((o) => (
        <AnswerObstacle
          key={o.id}
          option={o.option}
          position={[o.lane * 1, -0.2, o.z]} // lanes closer together
        />
      ))}
    </>
  );
}
