import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

interface CharacterPreviewProps {
  characterName: string;
  isSelected: boolean;
  onClick: () => void;
  isUnlocked?: boolean;
  unlockCost?: number;
}

const CharacterModel: React.FC<{ characterName: string }> = ({ characterName }) => {
  const group = useRef<THREE.Group>(null);
  const [metadata, setMetadata] = useState<any>(null);
  
  // Load character metadata
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const response = await fetch(`/3d/models/${characterName}/metadata.json`);
        const data = await response.json();
        setMetadata(data);
      } catch (error) {
        console.error('Error loading character metadata:', error);
      }
    };
    loadMetadata();
  }, [characterName]);
  
  // Load the model
  const { scene } = useGLTF(
    metadata?.modelUrl || `/3d/models/${characterName}/model.glb`
  ) as any;
  
  // Animate the model
  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.5;
    }
  });
  
  return (
    <group ref={group}>
      <primitive object={scene.clone()} />
    </group>
  );
};

const CharacterPreview: React.FC<CharacterPreviewProps> = ({
  characterName,
  isSelected,
  onClick,
  isUnlocked = true,
  unlockCost = 0
}) => {
  return (
    <div 
      className={`relative w-64 h-64 rounded-lg overflow-hidden cursor-pointer transition-all ${
        isSelected ? 'ring-4 ring-indigo-500 scale-105' : 'hover:scale-105'
      }`}
      onClick={onClick}
    >
      <Canvas camera={{ position: [0, 1.5, 3], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <CharacterModel characterName={characterName} />
        <Environment preset="city" />
        <OrbitControls 
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 text-center text-white">
        {characterName.charAt(0).toUpperCase() + characterName.slice(1)}
      </div>
      {!isUnlocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
          <div className="text-center text-white">
            <p className="text-lg font-bold">Locked</p>
            <p className="text-sm">{unlockCost} gems to unlock</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterPreview; 