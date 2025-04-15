import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment as DreiEnvironment, useGLTF } from '@react-three/drei';
import QuestionOverlay from './QuestionOverlay';
import { useGameStore } from '../stores/gameStore';

// Load the 3D models
const Character = () => {
  const { scene } = useGLTF('/3d/models/joyce/model.glb');
  return <primitive object={scene} scale={0.5} />;
};

const GameEnvironment = () => {
  const { scene } = useGLTF('/3d/environments/terain/model.glb');
  return <primitive object={scene} scale={1} />;
};

const Game: React.FC = () => {
  const { currentQuestion, score, answerQuestion } = useGameStore();

  const handleAnswer = async (answer: string) => {
    if (currentQuestion) {
      await answerQuestion(answer);
    }
  };

  return (
    <div className="relative w-full h-screen">
      <Canvas
        camera={{ position: [0, 5, 10], fov: 75 }}
        shadows
      >
        <Suspense fallback={null}>
          <DreiEnvironment preset="sunset" />
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 10, 5]}
            intensity={1}
            castShadow
          />
          <Character />
          <GameEnvironment />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
      {currentQuestion && <QuestionOverlay onAnswer={handleAnswer} />}
      <div className="absolute top-4 right-4 text-white text-xl">
        Score: {score}
      </div>
    </div>
  );
};

export default Game; 