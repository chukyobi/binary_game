// components/QuestionBillboard.tsx
import { Text } from "@react-three/drei";
import { useGameStore } from "../stores/gameStore";

export default function QuestionBillboard() {
  const currentQuestion = useGameStore((s) => s.currentQuestion);
  if (!currentQuestion) return null;

  return (
    <group position={[1.5, -0.1, 0.5]} /* relative to character */>
      <Text
        fontSize={0.06}
        color="white"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="black"
      >
        {currentQuestion.question}
      </Text>
    </group>
  );
}
