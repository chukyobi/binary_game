import { RigidBody } from "@react-three/rapier";
import { Text } from "@react-three/drei";
import { useGameStore } from "../stores/gameStore";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

export default function AnswerObstacle({
  option,
  position,
}: {
  option: string;
  position: [number, number, number];
}) {
  const ref = useRef<any>(null);
  const isPaused = useGameStore((s) => s.isPaused);
  const [alive, setAlive] = useState(true);
  const speed = 5; // movement speed towards player

  useFrame((_, delta) => {
    if (!ref.current || !alive || isPaused) return;

    const t = ref.current.translation();
    const nextZ = t.z + speed * delta;

    // move obstacle forward
    ref.current.setNextKinematicTranslation({
      x: t.x,
      y: t.y,
      z: nextZ,
    });

    // despawn after passing player
    if (nextZ > 5) {
      setAlive(false);
    }
  });

  if (!alive) return null;

  return (
    <RigidBody
      ref={ref}
      type="kinematicPosition"
      colliders="cuboid"
      position={position}
      onCollisionEnter={() => {
        const { currentQuestion, answerQuestion } = useGameStore.getState();
        if (!currentQuestion) return;

        if (option === currentQuestion.correctAnswer) {
          // ✅ Correct answer → award points + load next Q
          console.log("Correct! 🎉", option);
          answerQuestion(option);
        } else {
          // ❌ Wrong answer → Game Over
          console.log("Wrong! ❌", option);
          useGameStore.setState({ isGameOver: true });
        }

        setAlive(false); // remove obstacle after collision
      }}
    >
      <mesh>
        {/* Cube */}
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial color="orange" />

        {/* Answer text */}
        <Text
          fontSize={0.35}
          color="black"
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0.6]} // stick text in front
        >
          {option}
        </Text>
      </mesh>
    </RigidBody>
  );
}
