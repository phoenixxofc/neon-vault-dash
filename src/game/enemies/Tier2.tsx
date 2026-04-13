import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { hexToWorld } from '../../utils/hexGrid';
import { useGameStore } from '../../store/useGameStore';

interface EnemyProps {
  q: number;
  r: number;
}

export const EchoHunter: React.FC<EnemyProps> = () => {
  const meshRef = useRef<THREE.Group>(null);
  const velocity = useRef(new THREE.Vector3());
  const { playerPosition } = useGameStore();
  const lastPlayerPos = useRef(new THREE.Vector3(...playerPosition));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const currentPlayerPos = new THREE.Vector3(...playerPosition);
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
  const { playerPosition, damagePlayer } = useGameStore();

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
      const p = new THREE.Vector3(...playerPosition);
      const line = new THREE.Line3(posA_curr, posB_curr);
      const closestPoint = new THREE.Vector3();
      line.closestPointToPoint(p, true, closestPoint);
      if (p.distanceTo(closestPoint) < 0.4) {
          damagePlayer(1); // Continuous damage
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

export const MineLayer: React.FC<EnemyProps> = () => {
  return (
    <mesh position={[0, -0.4, 0]}>
      <cylinderGeometry args={[0.5, 0.5, 0.05, 6]} />
      <meshStandardMaterial color="#FF4500" transparent opacity={0.5} />
    </mesh>
  );
};
