"use client";

import React, {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, RigidBody, RigidBodyApi, CuboidCollider  } from "@react-three/rapier";
import {
  Environment as DreiEnvironment,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";

import LoadingSpinner from "./LoadingSpinner";
import Obstacles from "./Obstacles";
import QuestionBillboard from "./QuestionBillboard";

import { useGameStore } from "../stores/gameStore";
import { useAuthStore } from "../stores/authStore";
import QuestionOverlay from "./QuestionOverlay";
import GameOver from "./GameOver";



const CHARACTER_MODEL = "/3d/models/adventurer/model.glb";
const ENVIRONMENT_MODEL = "/3d/environments/city/scene.glb";

const direction = {
  current: { forward: false, backward: false, right: false, left: false },
};
//const characterRotationY = { current: 0 };

const Character = () => {
  const { scene } = useGLTF(CHARACTER_MODEL);
  const ref = useRef<RigidBodyApi>(null);
  const posXRef = useRef(0.3);

  useEffect(() => {
    if (scene) {
      scene.rotation.y = Math.PI; // rotate the model, not the rigidbody
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "a" || key === "arrowleft") direction.current.left = true;
      if (key === "d" || key === "arrowright") direction.current.right = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === "a" || key === "arrowleft") direction.current.left = false;
      if (key === "d" || key === "arrowright") direction.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [scene]);

  useFrame((_, delta) => {
    if (!ref.current) return;

    const moveSpeed = 3;
    const inputAxis =
      (direction.current.right ? 1 : 0) - (direction.current.left ? 1 : 0);
    posXRef.current += inputAxis * moveSpeed * delta;

    const currentPos = ref.current.translation();
    ref.current.setNextKinematicTranslation({
      x: THREE.MathUtils.lerp(currentPos.x, posXRef.current, delta * moveSpeed),
      y: -0.45,
      z: 1.7,
    });
  });

  return (
    <RigidBody
      ref={ref}
      type="kinematicPosition"
      colliders={false} // turn off auto colliders
      onCollisionEnter={(payload) => {
        // 'other' does not exist on type 'CollisionEnterPayload'
        // Log the whole payload for debugging
        console.log("Character hit:", payload);
      }}
    >
      {/* Character model */}
      <primitive object={scene} scale={0.15} />

      {/* Physics collider */}
      <CuboidCollider args={[0.5, 1, 0.5]} /> 
    </RigidBody>
  );
};


const GameEnvironment = () => {
  const { scene } = useGLTF(ENVIRONMENT_MODEL);
  const envRef = useRef<THREE.Group>(null);

  // Store initial position for reference
  const initialPos = useRef<THREE.Vector3 | null>(null);

  useEffect(() => {
    // Center the environment
    const box = new THREE.Box3().setFromObject(scene);
    const center = new THREE.Vector3();
    box.getCenter(center);
    scene.position.sub(center);
    scene.position.y = -0.5;

    // Store initial position
    initialPos.current = scene.position.clone();
  }, [scene]);

  useFrame((_, delta) => {
    if (!envRef.current || !initialPos.current) return;

    // Subtle parallax effect when moving
    if (direction.current.forward) {
      // Move environment slightly backward to create parallax
      envRef.current.position.z += 0.5 * delta; // Adjust speed as needed
    }

    // Optional: Add slight horizontal movement when strafing
    if (direction.current.left) {
      envRef.current.position.x -= 0.3 * delta;
    }
    if (direction.current.right) {
      envRef.current.position.x += 0.3 * delta;
    }
  });

  return <primitive ref={envRef} object={scene} scale={0.22} />;
};

const Scene = () => {
  const charRef = useRef<THREE.Group>(null);



  // Movement effect controls
  const movementIntensity = useRef(0);
  const headBobOffset = useRef(0);

  useFrame(({ camera }, delta) => {
    if (!charRef.current) return;

    // 1. Get character state
    const characterPos = new THREE.Vector3();
    charRef.current.getWorldPosition(characterPos);
    const characterRot = charRef.current.rotation.y;

    // 2. Calculate dynamic effects based on lateral movement only
    movementIntensity.current = 0;

    // Head bobbing (frequency adjusted for 0.6 speed)
    headBobOffset.current = 0;

    // 3. Camera offsets (aligned with +Z forward movement). No lateral sliding.
    const cameraOffset = new THREE.Vector3(1.2, -0.1, 3);
    const lookAtOffset = new THREE.Vector3(1.2, 0, 2);

    // Apply character rotation
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), characterRot);
    lookAtOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), characterRot);

    // 4. Movement effects (scaled to 0.6 speed)
    const pushVector = new THREE.Vector3(0, 0, 0);

    // No lateral camera lead; camera follows character only
    pushVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), characterRot);

    // Final positions
    const targetPos = characterPos
      .clone()
      .add(cameraOffset);

    const targetLookAt = characterPos
      .clone()
      .add(lookAtOffset);

    // 5. Smooth movement (pause-aware follow)
    const lerpFactor = 0.15;
    camera.position.lerp(targetPos, lerpFactor);
    camera.lookAt(targetLookAt);
  });

  return (
    <>
      <DreiEnvironment preset="sunset" />
      <ambientLight intensity={0.7} />
      <group ref={charRef}>
        <Character />
        {/* Question billboard floats above character */}
        <QuestionBillboard />
      </group>
      <GameEnvironment />
      <Obstacles />
    </>
  );
};

const Game: React.FC = () => {
  const {
    currentQuestion,
    score,
    currentLevel,
    answerQuestion,
    fetchQuestion,
    isPaused,
    setPaused,
    isGameOver,
    resetGame,
  } = useGameStore();
  const { user } = useAuthStore();

  const [modelError, setModelError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const initializeGame = useCallback(async () => {
    try {
      console.log("[Game] Initializing game...");
      setIsLoading(true);

      await Promise.all([
        useGLTF.preload(CHARACTER_MODEL),
        useGLTF.preload(ENVIRONMENT_MODEL),
      ]);

      if (!currentQuestion && currentLevel) {
        await fetchQuestion(currentLevel);
      }
    } catch (error) {
      console.error("[Game] Failed to initialize game:", error);
      setModelError("Failed to load game assets. Please refresh the page.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchQuestion, currentQuestion, currentLevel]);

  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  const handleAnswer = useCallback(
    async (answer: string) => {
      if (currentQuestion) {
        await answerQuestion(answer);
      }
    },
    [currentQuestion, answerQuestion]
  );
  

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
            canvas.addEventListener("webglcontextlost", (e) => {
              e.preventDefault();
              console.warn("[Canvas] WebGL context lost.");
            });
            canvas.addEventListener("webglcontextrestored", () => {
              console.info("[Canvas] WebGL context restored.");
            });
          }}
        >
          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]}>
              {/* Your game components */}
              <Scene />
            </Physics>
          </Suspense>
        </Canvas>
      </div>

      {/* Touch/Click Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4 z-10 select-none">
        <button
          className="px-5 py-3 rounded-lg bg-black/60 text-white border border-white/20 active:bg-black/80"
          onMouseDown={() => !isPaused && (direction.current.left = true)}
          onMouseUp={() => (direction.current.left = false)}
          onMouseLeave={() => (direction.current.left = false)}
          onTouchStart={(e) => {
            e.preventDefault();
            if (!isPaused) direction.current.left = true;
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            direction.current.left = false;
          }}
        >
          ◀ Left
        </button>
        <button
          className="px-5 py-3 rounded-lg bg-black/60 text-white border border-white/20 active:bg-black/80"
          onMouseDown={() => !isPaused && (direction.current.right = true)}
          onMouseUp={() => (direction.current.right = false)}
          onMouseLeave={() => (direction.current.right = false)}
          onTouchStart={(e) => {
            e.preventDefault();
            if (!isPaused) direction.current.right = true;
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            direction.current.right = false;
          }}
        >
          Right ▶
        </button>
      </div>

      <div className="absolute top-4 right-4 text-white text-xl">
        Score: {score}
      </div>
      <div className="absolute top-16 right-4 z-10">
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          onClick={() => setPaused(true)}
          disabled={!currentQuestion}
        >
          Hint
        </button>
      </div>

       {/* Question Overlay */}
    <QuestionOverlay onAnswer={handleAnswer} />

      {isPaused && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <div className="bg-gray-900 text-white p-6 rounded-lg max-w-lg w-11/12 text-center space-y-4">
            <h3 className="text-lg font-semibold">Hint</h3>
            <p className="text-sm leading-relaxed">
              {currentQuestion
                ? `Think about converting binary to decimal. Each digit represents a power of 2: from right to left 2^0, 2^1, 2^2, ... Add the values where there is a 1.`
                : "No question loaded."}
            </p>
            <button
              className="mt-2 px-4 py-2 rounded bg-green-600 hover:bg-green-700"
              onClick={() => setPaused(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 text-white text-md bg-black bg-opacity-50 px-4 py-2 rounded-lg shadow">
        {user?.username ? `Player: ${user.username}` : "Guest"}
      </div>

      {isGameOver && <GameOver onRestart={() => resetGame()} />}

    </div>
  );
};

export default Game;
