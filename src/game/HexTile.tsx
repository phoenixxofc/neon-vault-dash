import { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';
import { hexToWorld } from '../utils/hexGrid';
import * as THREE from 'three';

export type TileState = 'STABLE' | 'WARNING' | 'VOID';

interface HexTileProps {
  q: number;
  r: number;
}

const HexTile: React.FC<HexTileProps> = ({ q, r }) => {
  const [state, setState] = useState<TileState>('STABLE');
  const [timer, setTimer] = useState<number | null>(null);
  const [isGreen, setIsGreen] = useState(false);

  const meshRef = useRef<THREE.Mesh>(null);
  const { currentLevel } = useGameStore();
  const pos = useMemo(() => hexToWorld(q, r), [q, r]);

  const warningDuration = useMemo(() => {
    if (currentLevel >= 60) return 0;
    if (currentLevel >= 30) return 1000;
    return 3000;
  }, [currentLevel]);

  useEffect(() => {
    if (Math.random() < 0.02) setIsGreen(true);

    const triggerChance = 0.05 + (currentLevel * 0.005);
    const interval = setInterval(() => {
      if (state === 'STABLE' && !isGreen && Math.random() < triggerChance) {
        setState('WARNING');
        setTimer(Date.now());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [state, currentLevel, isGreen]);

  useFrame((_, delta) => {
    if (state === 'WARNING' && timer) {
      const elapsed = Date.now() - timer;
      if (meshRef.current) {
        meshRef.current.position.y = Math.sin(Date.now() * 0.2) * 0.05;
      }
      if (elapsed >= warningDuration) {
        setState('VOID');
        setTimer(null);
      }
    }

    if (state === 'VOID' && meshRef.current) {
      meshRef.current.position.y -= delta * 5;
      if (meshRef.current.position.y < -10) {
        meshRef.current.visible = false;
      }
    }
  });

  const getColor = () => {
    if (isGreen) return "#00FF00";
    switch (state) {
      case 'WARNING':
        return currentLevel >= 30 ? "#FF0000" : "#FFFF00";
      case 'VOID':
        return "#000000";
      default:
        return "#1a0b2e";
    }
  };

  return (
    <mesh
      ref={meshRef}
      position={pos}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <cylinderGeometry args={[0.95, 0.95, 0.1, 6]} />
      <meshStandardMaterial
        color={getColor()}
        emissive={getColor()}
        emissiveIntensity={state === 'WARNING' ? 2 : isGreen ? 1 : 0}
        transparent={state === 'VOID'}
        opacity={state === 'VOID' ? 0.5 : 1}
      />
    </mesh>
  );
};

export default HexTile;
