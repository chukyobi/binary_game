import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useAssetStore } from '../stores/assetStore';

const Character: React.FC = () => {
  const characterRef = useRef<THREE.Group>(null);
  const { selectedCharacter } = useAssetStore();
  const { scene } = useGLTF(selectedCharacter?.modelUrl || '/models/default-character.glb');

  useFrame(() => {
    if (characterRef.current) {
      characterRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={characterRef} position={[0, 0, 0]}>
      <primitive object={scene} scale={0.5} />
    </group>
  );
};

export default Character; 