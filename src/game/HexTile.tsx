import { useState, useEffect, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store/useGameStore';
import { hexToWorld } from '../utils/hexGrid';
import { Sparkles } from '@react-three/drei';
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
  const [, setGreenTimer] = useState(0);

  const meshRef = useRef<THREE.Mesh>(null);
  const { currentLevel, playerPosition, greenHexHeal, setIsOnWarningTile } = useGameStore();
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
    // Green Hex Healing Logic
    if (isGreen && meshRef.current) {
      const dist = new THREE.Vector3(playerPosition[0], 0, playerPosition[2]).distanceTo(new THREE.Vector3(pos.x, 0, pos.z));
      if (dist < 0.8) {
        setGreenTimer(prev => {
          const next = prev + delta;
          if (next >= 3) {
            greenHexHeal();
            return 0; // Reset
          }
          return next;
        });
      } else {
        setGreenTimer(0);
      }
    }

    if (state === 'WARNING' && timer) {
      const elapsed = Date.now() - timer;
      if (meshRef.current) {
        meshRef.current.position.y = Math.sin(Date.now() * 0.2) * 0.05;

        // Check if player is on this warning tile
        const dist = new THREE.Vector3(playerPosition[0], 0, playerPosition[2]).distanceTo(new THREE.Vector3(pos.x, 0, pos.z));
        if (dist < 0.8) {
            setIsOnWarningTile(true);
        }
      }
      if (elapsed >= warningDuration) {
        setState('VOID');
        setTimer(null);
        // Only reset if we were the one setting it, but multiple tiles could be warning.
        // Simplified: set to false in a cleanup or global check.
        // Better: reset in useFrame of LogicController or similar.
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
    <group position={pos}>
        <mesh
            ref={meshRef}
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
        {state === 'VOID' && (
            <Sparkles
                count={20}
                scale={1}
                size={2}
                speed={0.5}
                color={currentLevel >= 30 ? "#FF0000" : "#FFFF00"}
            />
        )}
    </group>
  );
};

export default HexTile;
