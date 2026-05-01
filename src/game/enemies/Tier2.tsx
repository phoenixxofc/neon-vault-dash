import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { hexToWorld } from '../../utils/hexGrid';
import { useGameStore } from '../../store/useGameStore';

interface EnemyProps {
  q: number;
  r: number;
  id: string;
}

export const EchoHunter: React.FC<EnemyProps> = ({ id }) => {
  const meshRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const lastPlayerPos = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const playerPos = useGameStore.getState().playerPosition;
    const currentPlayerPos = new THREE.Vector3(...playerPos);
    if (currentPlayerPos.distanceTo(lastPlayerPos.current) > 1.0) {
        // Player dashed
        const worldPos = new THREE.Vector3();
        meshRef.current.getWorldPosition(worldPos);
        const dir = new THREE.Vector3().subVectors(lastPlayerPos.current, worldPos).normalize();
        velocity.current.add(dir.multiplyScalar(0.5));
    }
    meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta * 60));
    velocity.current.multiplyScalar(0.9);
    lastPlayerPos.current.copy(currentPlayerPos);
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <coneGeometry args={[0.4, 0.8, 4]} />
        <meshStandardMaterial color="#FFA500" emissive="#FFA500" />
      </mesh>
    </group>
  );
};

export const Tether: React.FC<{ posA: [number, number], posB: [number, number] }> = ({ posA, posB }) => {
  const meshARef = useRef<THREE.Group>(null);
  const meshBRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  const worldA = useMemo(() => hexToWorld(posA[0], posA[1]), [posA]);
  const worldB = useMemo(() => hexToWorld(posB[0], posB[1]), [posB]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const offset = Math.sin(t) * 2;
    if (meshARef.current && meshBRef.current && beamRef.current) {
      meshARef.current.position.x = worldA.x + offset;
      meshBRef.current.position.x = worldB.x + offset;

      const posA_curr = meshARef.current.position;
      const posB_curr = meshBRef.current.position;

      const midPoint = new THREE.Vector3().lerpVectors(posA_curr, posB_curr, 0.5);
      beamRef.current.position.copy(midPoint);
      beamRef.current.lookAt(posB_curr);
      beamRef.current.scale.z = posA_curr.distanceTo(posB_curr);

      // Simple line-segment distance check for player
      const state = useGameStore.getState();
      const p = new THREE.Vector3(...state.playerPosition);
      const line = new THREE.Line3(posA_curr, posB_curr);
      const closestPoint = new THREE.Vector3();
      line.closestPointToPoint(p, true, closestPoint);
      if (p.distanceTo(closestPoint) < 0.4) {
          state.damagePlayer(1); // Continuous damage
      }
    }
  });

  return (
    <group>
      <group ref={meshARef} position={[worldA.x, 0.5, worldA.z]}>
        <mesh><sphereGeometry args={[0.3]} /><meshStandardMaterial color="#FFFF00" /></mesh>
      </group>
      <group ref={meshBRef} position={[worldB.x, 0.5, worldB.z]}>
        <mesh><sphereGeometry args={[0.3]} /><meshStandardMaterial color="#FFFF00" /></mesh>
      </group>
      <mesh ref={beamRef} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#FFFF00" emissive="#FFFF00" emissiveIntensity={5} />
      </mesh>
    </group>
  );
};

export const MineLayer: React.FC<EnemyProps> = ({ id }) => {
  const [mines, setMines] = React.useState<{ id: number, pos: [number, number, number], exploded: boolean }[]>([]);
  const lastMine = useRef(0);

  useFrame((state) => {
    const now = state.clock.getElapsedTime();
    if (now - lastMine.current > 4) {
      lastMine.current = now;
      const pPos = useGameStore.getState().playerPosition;
      setMines(prev => [...prev, { id: Date.now(), pos: [...pPos], exploded: false }]);
    }

    // Explode logic
    mines.forEach(mine => {
        if (!mine.exploded) {
            const pPos = useGameStore.getState().playerPosition;
            const dist = new THREE.Vector3(...mine.pos).distanceTo(new THREE.Vector3(...pPos));
            if (dist < 0.6) {
                useGameStore.getState().damagePlayer(15);
                mine.exploded = true;
                setMines(prev => prev.map(m => m.id === mine.id ? { ...m, exploded: true } : m));
            }
        }
    });
  });

  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.8, 6]} />
        <meshStandardMaterial color="#FF4500" emissive="#FF4500" />
      </mesh>
      {mines.map(mine => !mine.exploded && (
          <mesh key={mine.id} position={[mine.pos[0] - 0, 0.1, mine.pos[2] - 0]}>
              <sphereGeometry args={[0.2]} />
              <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={2} />
          </mesh>
      ))}
    </group>
  );
};
