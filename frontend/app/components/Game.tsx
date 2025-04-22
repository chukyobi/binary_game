'use client';

import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Environment as DreiEnvironment,
  useGLTF,
  useAnimations,
} from '@react-three/drei';
import * as THREE from 'three';

import LoadingSpinner from './LoadingSpinner';
import QuestionOverlay from './QuestionOverlay';

import { useGameStore } from '../stores/gameStore';
import { useAuthStore } from '../stores/authStore';

const CHARACTER_MODEL = '/3d/models/adventurer/model.glb';
const ENVIRONMENT_MODEL = '/3d/environments/city/scene.glb';

// Shared direction ref so both components can access it
const direction = { current: { forward: false, right: false, left: false } };

const Character = () => {
  const { scene, animations } = useGLTF(CHARACTER_MODEL);
  const ref = useRef<THREE.Group>(null);
  const { actions, mixer } = useAnimations(animations, ref);

  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);

  const velocity = useRef(0);

  useEffect(() => {
    if (animations) {
      const animNames = animations.map(anim => anim.name);
      console.log("Available animations:", animNames);
      setAvailableAnimations(animNames);
    }

    if (actions) {
      console.log("Action keys:", Object.keys(actions));
    }
  }, [animations, actions]);

  useEffect(() => {
    if (scene && ref.current) {
      ref.current.rotation.y = Math.PI;
      const bbox = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      const size = new THREE.Vector3();
      bbox.getCenter(center);
      bbox.getSize(size);
      scene.position.set(1.3, -0.4, 2.5);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          direction.current.forward = true;
          setIsRunning(true);
          break;
        case 'd':
          direction.current.right = true;
          break;
        case 'a':
          direction.current.left = true;
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          direction.current.forward = false;
          setIsRunning(false);
          break;
        case 'd':
          direction.current.right = false;
          break;
        case 'a':
          direction.current.left = false;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) {
      console.error("No animation actions available");
      return;
    }

    const runAnimation =
      actions['Run'] ||
      actions['run'] ||
      actions['Running'] ||
      actions['running'] ||
      Object.entries(actions).find(([name]) => name.toLowerCase().includes('run'))?.[1];

    const firstAnimation = Object.values(actions)[0];

    if (isRunning) {
      if (runAnimation) {
        console.log("Playing run animation");
        mixer?.stopAllAction();
        runAnimation.reset().fadeIn(0.2).play();
        setCurrentAnimation(Object.keys(actions).find(key => actions[key] === runAnimation) || null);
      } else if (firstAnimation) {
        console.log("No run animation found, playing first available animation");
        mixer?.stopAllAction();
        firstAnimation.reset().fadeIn(0.2).play();
        setCurrentAnimation(Object.keys(actions).find(key => actions[key] === firstAnimation) || null);
      }
    } else {
      const idleAnimation =
        actions['Idle'] ||
        actions['idle'] ||
        actions['Standing'] ||
        actions['standing'] ||
        Object.entries(actions).find(([name]) => name.toLowerCase().includes('idle'))?.[1] ||
        firstAnimation;

      if (idleAnimation) {
        console.log("Playing idle animation");
        mixer?.stopAllAction();
        idleAnimation.reset().fadeIn(0.2).play();
        setCurrentAnimation(Object.keys(actions).find(key => actions[key] === idleAnimation) || null);
      }
    }
  }, [isRunning, actions, mixer]);

  useFrame((_, delta) => {
    if (mixer) {
      mixer.update(delta);
    }
  
    if (ref.current) {
      const rotateSpeed = 2; // radians per second
  
      if (direction.current.left) {
        ref.current.rotation.y += rotateSpeed * delta;
      }
      if (direction.current.right) {
        ref.current.rotation.y -= rotateSpeed * delta;
      }
    }
  });
  
  return <primitive ref={ref} object={scene} scale={0.15} />;
};

const GameEnvironment = () => {
  const { scene } = useGLTF(ENVIRONMENT_MODEL);
  const envRef = useRef<THREE.Group>(null);

  const [isPlayerRunning, setIsPlayerRunning] = useState(false);
  const playerVelocity = useRef(0);

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);

    scene.position.x -= center.x;
    scene.position.z -= center.z;
    scene.position.y = -0.5;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w') {
        setIsPlayerRunning(true);
        playerVelocity.current = 2;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'w') {
        setIsPlayerRunning(false);
        playerVelocity.current = 0;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [scene]);

  useFrame((_, delta) => {
    if (!envRef.current) return;

    const speed = 2;
    const offset = new THREE.Vector3();

    if (direction.current.forward) {
      offset.z += speed * delta;
    }
    if (direction.current.right) {
      offset.x -= speed * delta;
    }
    if (direction.current.left) {
      offset.x += speed * delta;
    }

    envRef.current.position.add(offset);
  });

  return <primitive ref={envRef} object={scene} scale={0.22} />;
};

const Scene = () => {
  const charRef = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    if (charRef.current) {
      const charPos = new THREE.Vector3();
      charRef.current.getWorldPosition(charPos);

      const followOffset = new THREE.Vector3(1.2, -0.1, 3);
      const lookAtOffset = new THREE.Vector3(1.2, 0, 2);

      const targetPos = charPos.clone().add(followOffset);
      camera.position.lerp(targetPos, 0.1);

      const lookAtPos = charPos.clone().add(lookAtOffset);
      camera.lookAt(lookAtPos);
    }
  });

  return (
    <>
      <DreiEnvironment preset="sunset" />
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
      <spotLight
        position={[0, 5, 0]}
        intensity={0.8}
        angle={0.6}
        penumbra={0.5}
        castShadow
        target={charRef.current || undefined}
      />
      <group ref={charRef}>
        <Character />
      </group>
      <GameEnvironment />
    </>
  );
};

const Game: React.FC = () => {
  const { currentQuestion, score, currentLevel, answerQuestion, fetchQuestion } = useGameStore();
  const { user } = useAuthStore();

  const [modelError, setModelError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeGame = useCallback(async () => {
    try {
      console.log('[Game] Initializing game...');
      setIsLoading(true);

      await Promise.all([
        useGLTF.preload(CHARACTER_MODEL),
        useGLTF.preload(ENVIRONMENT_MODEL),
      ]);

      if (!currentQuestion && currentLevel) {
        await fetchQuestion(currentLevel);
      }
    } catch (error) {
      console.error('[Game] Failed to initialize game:', error);
      setModelError('Failed to load game assets. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, [fetchQuestion, currentQuestion, currentLevel]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleAnswer = useCallback(async (answer: string) => {
    if (currentQuestion) {
      await answerQuestion(answer);
    }
  }, [currentQuestion, answerQuestion]);

  if (isLoading) {
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
          camera={{ position: [0, 1, 5], fov: 65 }}
          shadows
          gl={{ preserveDrawingBuffer: true }}
          onCreated={({ gl }) => {
            const canvas = gl.getContext().canvas;
            canvas.addEventListener('webglcontextlost', (e) => {
              e.preventDefault();
              console.warn('[Canvas] WebGL context lost.');
            });
            canvas.addEventListener('webglcontextrestored', () => {
              console.info('[Canvas] WebGL context restored.');
            });
          }}
        >
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* {currentQuestion && <QuestionOverlay onAnswer={handleAnswer} />} */}

      <div className="absolute top-4 right-4 text-white text-xl">Score: {score}</div>
      <div className="absolute top-4 left-4 text-white text-md bg-black bg-opacity-50 px-4 py-2 rounded-lg shadow">
        {user?.username ? `Player: ${user.username}` : 'Guest'}
      </div>
    </div>
  );
};

export default Game;
