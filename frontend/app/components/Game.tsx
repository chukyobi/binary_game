import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment as DreiEnvironment, useGLTF, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import QuestionOverlay from './QuestionOverlay';
import { useGameStore } from '../stores/gameStore';
import { useAssetStore } from '../stores/assetStore';
import { useAuthStore } from '../stores/authStore';
import LoadingSpinner from './LoadingSpinner';

// Load the 3D models
const Character = () => {
  const { selectedCharacter } = useAssetStore();
  const modelPath = selectedCharacter?.modelUrl || '/3d/models/joyce/model.glb';
  const [error, setError] = useState<string | null>(null);
  
  try {
    const gltf = useGLTF(modelPath, true);
    
    if (!gltf) {
      return null;
    }
    
    return <primitive object={gltf.scene} scale={0.5} />;
  } catch (err) {
    console.error('Error loading character model:', err);
    setError('Failed to load character model');
    return null;
  }
};

const GameEnvironment = () => {
  const { selectedEnvironment } = useAssetStore();
  const modelPath = selectedEnvironment?.modelUrl || '/3d/environments/terrain/scene.gltf';
  const texturePath = '/3d/environments/terrain/textures/Material.001_baseColor.jpeg';
  const [error, setError] = useState<string | null>(null);
  
  try {
    const gltf = useGLTF(modelPath, true);
    const texture = useTexture(texturePath);
    
    useEffect(() => {
      if (gltf?.scene && texture) {
        gltf.scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.map = texture;
                    mat.needsUpdate = true;
                  }
                });
              } else if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.map = texture;
                child.material.needsUpdate = true;
              }
            }
          }
        });
      }
    }, [gltf?.scene, texture]);
    
    if (!gltf) {
      return null;
    }
    
    return <primitive object={gltf.scene} scale={1} />;
  } catch (err) {
    console.error('Error loading environment model:', err);
    setError('Failed to load environment model');
    return null;
  }
};

const Scene = () => {
  return (
    <>
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
    </>
  );
};

const Game: React.FC = () => {
  const { currentQuestion, score, answerQuestion, fetchQuestion, currentLevel } = useGameStore();
  const { fetchAssets, isLoading: isAssetsLoading } = useAssetStore();
  const { user } = useAuthStore();
  const [modelError, setModelError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeGame = useCallback(async () => {
    try {
      setIsLoading(true);
      await fetchAssets();
      if (!currentQuestion && currentLevel) {
        await fetchQuestion(currentLevel);
      }
    } catch (error) {
      console.error('Failed to initialize game:', error);
      setModelError('Failed to load game assets. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchAssets, fetchQuestion, currentQuestion, currentLevel]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleAnswer = useCallback(async (answer: string) => {
    if (currentQuestion) {
      await answerQuestion(answer);
    }
  }, [currentQuestion, answerQuestion]);

  if (isLoading || isAssetsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen">
      {modelError && (
        <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-10">
          {modelError}
        </div>
      )}
      <div className="absolute w-full h-full">
        <Canvas
          camera={{ position: [0, 5, 10], fov: 75 }}
          shadows
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>
      {currentQuestion && <QuestionOverlay onAnswer={handleAnswer} />}
      <div className="absolute top-4 right-4 text-white text-xl">
        Score: {score}
      </div>
    </div>
  );
};

export default Game; 