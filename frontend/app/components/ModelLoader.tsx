import React, { useEffect, useRef } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group } from 'three';

interface ModelLoaderProps {
  modelUrl: string;
  animationUrls?: string[];
  position?: [number, number, number];
  scale?: [number, number, number];
  rotation?: [number, number, number];
  onClick?: () => void;
}

const ModelLoader: React.FC<ModelLoaderProps> = ({
  modelUrl,
  animationUrls = [],
  position = [0, 0, 0],
  scale = [1, 1, 1],
  rotation = [0, 0, 0],
  onClick
}) => {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(modelUrl);
  
  // Load animations if provided
  useEffect(() => {
    if (animationUrls.length > 0) {
      // Load animations from URLs
      // This is a placeholder - actual implementation would depend on your animation system
      console.log('Loading animations:', animationUrls);
    }
  }, [animationUrls]);
  
  // Rotate the model
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.5;
    }
  });
  
  return (
    <group
      ref={group}
      position={position}
      scale={scale}
      rotation={rotation}
      onClick={onClick}
    >
      <primitive object={scene} />
    </group>
  );
};

export default ModelLoader; 