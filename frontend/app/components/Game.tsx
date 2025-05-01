"use client";

import React, {
  Suspense,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, RigidBody, RigidBodyApi  } from "@react-three/rapier";
import {
  OrbitControls,
  Environment as DreiEnvironment,
  useGLTF,
  useAnimations,
} from "@react-three/drei";
import * as THREE from "three";

import LoadingSpinner from "./LoadingSpinner";
import QuestionOverlay from "./QuestionOverlay";

import { useGameStore } from "../stores/gameStore";
import { useAuthStore } from "../stores/authStore";

const CHARACTER_MODEL = "/3d/models/adventurer/model.glb";
const ENVIRONMENT_MODEL = "/3d/environments/city/scene.glb";

const direction = {
  current: { forward: false, backward: false, right: false, left: false },
};
//const characterRotationY = { current: 0 };

const Character = () => {
  const { scene, animations } = useGLTF(CHARACTER_MODEL);
  const ref = useRef<THREE.Group>(null);
  const { actions, mixer } = useAnimations(animations, ref);
  const { camera } = useThree();

  const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [availableAnimations, setAvailableAnimations] = useState<string[]>([]);

  //Extracts animation names and stores them when the model loads.
  useEffect(() => {
    if (animations) {
      const animNames = animations.map((anim) => anim.name);
      console.log("Available animations:", animNames);
      setAvailableAnimations(animNames);
    }
  }, [animations]);

  //   Sets character’s default rotation and position.  + Registers key listeners to update movement direction and run state.
  useEffect(() => {
    if (scene && ref.current) {
      ref.current.rotation.y = Math.PI;
      const bbox = new THREE.Box3().setFromObject(scene);
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      scene.position.set(-1.3, -0.4, -2.55);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "w":
          direction.current.forward = true;
          setIsRunning(true);
          break;
        case "z":
          direction.current.backward = true;
          setIsRunning(true);
          break;
        case "a":
          direction.current.left = true;
          break;
        case "d":
          direction.current.right = true;
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "w":
          direction.current.forward = false;
          setIsRunning(false);
          break;
        case "z":
          direction.current.forward = false;
          setIsRunning(false);
          break;
        case "a":
          direction.current.left = false;
          break;
        case "d":
          direction.current.right = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!actions || Object.keys(actions).length === 0) {
      console.error("No animation actions available");
      return;
    }

    const findAnimation = (
      names: string[],
      fallbackNames: string[]
    ): THREE.AnimationAction | undefined => {
      for (const name of names) {
        const action = actions[name];
        if (action) return action;
      }

      for (const action of Object.values(actions)) {
        if (!action) continue;
        for (const name of fallbackNames) {
          if (
            action.getClip().name.toLowerCase().includes(name.toLowerCase())
          ) {
            return action;
          }
        }
      }

      return undefined;
    };

    let nextAnimation: THREE.AnimationAction | undefined;

    if (isRunning) {
      nextAnimation = findAnimation(
        ["Run", "run", "Running", "running"],
        ["run"]
      );
    } else {
      nextAnimation = findAnimation(
        ["Idle", "idle", "Standing", "standing"],
        ["idle"]
      );
    }

    if (!nextAnimation) {
      const availableActions = Object.values(actions).filter(
        (a): a is THREE.AnimationAction => a !== null
      );
      if (availableActions.length > 0) {
        nextAnimation = availableActions[0];
        console.warn(
          "No matching animation found, falling back to first available."
        );
      }
    }

    if (nextAnimation) {
      const clipName = nextAnimation.getClip().name;
      if (!currentAnimation || currentAnimation !== clipName) {
        mixer?.stopAllAction();
        nextAnimation.reset().fadeIn(0.2).play();
        setCurrentAnimation(clipName);
        console.log(`Playing animation: ${clipName}`);
      }
    }
  }, [isRunning, actions, mixer, currentAnimation]);

  useFrame((_, delta) => {
    if (mixer) mixer.update(delta);
    if (!ref.current) return;

    const moveSpeed = 0.6;
    const moveDir = new THREE.Vector3();

    if (direction.current.forward) moveDir.z -= -1;
    if (direction.current.forward) moveDir.z -= +1;
    if (direction.current.left) moveDir.x -= 1;
    if (direction.current.right) moveDir.x += 1;

    if (moveDir.lengthSq() > 0) {
      // Camera-relative movement
      const cameraDir = new THREE.Vector3();
      camera.getWorldDirection(cameraDir);
      cameraDir.y = 0;
      cameraDir.normalize();

      const right = new THREE.Vector3();
      right.crossVectors(new THREE.Vector3(0, 1, 0), cameraDir).normalize();

      const finalDir = new THREE.Vector3();
      finalDir.addScaledVector(cameraDir, moveDir.z);
      finalDir.addScaledVector(right, moveDir.x);
      finalDir.normalize();

      ref.current.position.addScaledVector(finalDir, moveSpeed * delta);

      if (finalDir.lengthSq() > 0.01) {
        const targetY = Math.atan2(finalDir.x, finalDir.z);
        ref.current.rotation.y = targetY;
      }
    }
  });

  return (
    <group ref={ref}>
      <primitive object={scene} scale={0.15} />
    </group>
  );
};

// const GameEnvironment = () => {
//   const { scene } = useGLTF(ENVIRONMENT_MODEL);
//   const envRef = useRef<THREE.Group>(null);

//   const [isPlayerRunning, setIsPlayerRunning] = useState(false);
//   const playerVelocity = useRef(0);

//   useEffect(() => {
//     const box = new THREE.Box3().setFromObject(scene);
//     const center = new THREE.Vector3();
//     box.getCenter(center);

//     scene.position.x -= center.x;
//     scene.position.z -= center.z;
//     scene.position.y = -0.5;

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (e.key.toLowerCase() === 'w') {
//         setIsPlayerRunning(true);
//         playerVelocity.current = 2;
//       }
//     };

//     const handleKeyUp = (e: KeyboardEvent) => {
//       if (e.key.toLowerCase() === 'w') {
//         setIsPlayerRunning(false);
//         playerVelocity.current = 0;
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     window.addEventListener('keyup', handleKeyUp);

//     return () => {
//       window.removeEventListener('keydown', handleKeyDown);
//       window.removeEventListener('keyup', handleKeyUp);
//     };
//   }, [scene]);

//   useFrame((_, delta) => {
//     if (!envRef.current) return;

//     const speed = 2;
//     const offset = new THREE.Vector3();

//     if (direction.current.forward) {
//       offset.z += speed * delta;
//     }
//     if (direction.current.right) {
//       offset.x -= speed * delta;
//     }
//     if (direction.current.left) {
//       offset.x += speed * delta;
//     }

//     envRef.current.position.add(offset);
//   });

//   return <primitive ref={envRef} object={scene} scale={0.22} />;
// };

// const Scene = () => {
//   const charRef = useRef<THREE.Group>(null);

//   useFrame(({ camera }) => {
//     if (charRef.current) {
//       // Get character's world position
//       const charPos = new THREE.Vector3();
//       charRef.current.getWorldPosition(charPos);

//       // Calculate camera offset relative to character's rotation
//       const followOffset = new THREE.Vector3(1.2, -0.1, 3);
//       const lookAtOffset = new THREE.Vector3(1.2, 0, 2);

//       // Rotate the offset vectors based on character's Y rotation
//       followOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), charRef.current.rotation.y);
//       lookAtOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), charRef.current.rotation.y);

//       // Calculate target positions
//       const targetPos = charPos.clone().add(followOffset);
//       camera.position.lerp(targetPos, 0.1);

//       const lookAtPos = charPos.clone().add(lookAtOffset);
//       camera.lookAt(lookAtPos);
//     }
//   });

//   return (
//     <>
//       <DreiEnvironment preset="sunset" />
//       <ambientLight intensity={0.7} />
//       <directionalLight position={[10, 10, 5]} intensity={1.2} castShadow />
//       <spotLight
//         position={[0, 5, 0]}
//         intensity={0.8}
//         angle={0.6}
//         penumbra={0.5}
//         castShadow
//         target={charRef.current || undefined}
//       />
//       <group ref={charRef}>
//         <Character />
//       </group>
//       <GameEnvironment />
//     </>
//   );
// };

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

  // Your original offsets (preserved)
  // const baseCameraOffset = useRef(new THREE.Vector3(1.2, 0, 2)); // Right, height, distance
  // const baseLookAtOffset = useRef(new THREE.Vector3(1.2, -0.1, 3)); // Look target

  // Movement effect controls
  const movementIntensity = useRef(0);
  const headBobOffset = useRef(0);

  useFrame(({ camera }, delta) => {
    if (!charRef.current) return;

    // 1. Get character state
    const characterPos = new THREE.Vector3();
    charRef.current.getWorldPosition(characterPos);
    const characterRot = charRef.current.rotation.y;

    // 2. Calculate dynamic effects (adjusted for 0.6 speed)
    movementIntensity.current = THREE.MathUtils.lerp(
      movementIntensity.current,
      direction.current.forward ? 0.15 : 0, // Reduced push amount for slower speed
      delta * 5
    );

    // Head bobbing (frequency adjusted for 0.6 speed)
    if (direction.current.forward) {
      headBobOffset.current = Math.sin(performance.now() * 0.008) * 0.03; // Slower, subtler bob
    } else {
      headBobOffset.current = THREE.MathUtils.lerp(
        headBobOffset.current,
        0,
        delta * 5
      );
    }

    // 3. Camera offsets (aligned with +Z forward movement)
    const cameraOffset = new THREE.Vector3(1.2, -0.1, 3); // Negative Z for behind
    const lookAtOffset = new THREE.Vector3(1.2, 0, 2); // Positive Z for ahead

    // Apply character rotation
    cameraOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), characterRot);
    lookAtOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), characterRot);

    // 4. Movement effects (scaled to 0.6 speed)
    const pushVector = new THREE.Vector3(0, 0, movementIntensity.current);
    pushVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), characterRot);

    // Final positions
    const targetPos = characterPos
      .clone()
      .add(cameraOffset)
      .add(pushVector)
      .add(new THREE.Vector3(0, headBobOffset.current, 0));

    const targetLookAt = characterPos
      .clone()
      .add(lookAtOffset)
      .add(new THREE.Vector3(0, headBobOffset.current * 0.5, 0));

    // 5. Smooth movement (tighter follow for slow speed)
    camera.position.lerp(targetPos, 0.15); // Increased from 0.1
    camera.lookAt(targetLookAt);
  });

  return (
    <>
      <DreiEnvironment preset="sunset" />
      <ambientLight intensity={0.7} />
      <group ref={charRef}>
        <Character />
      </group>
      <GameEnvironment />
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
              <Character />
              <Scene />
            </Physics>
          </Suspense>
        </Canvas>
      </div>
      {/* {currentQuestion && <QuestionOverlay onAnswer={handleAnswer} />} */}

      <div className="absolute top-4 right-4 text-white text-xl">
        Score: {score}
      </div>
      <div className="absolute top-4 left-4 text-white text-md bg-black bg-opacity-50 px-4 py-2 rounded-lg shadow">
        {user?.username ? `Player: ${user.username}` : "Guest"}
      </div>
    </div>
  );
};

export default Game;
