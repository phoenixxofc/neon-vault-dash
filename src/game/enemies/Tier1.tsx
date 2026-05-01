import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface EnemyProps {
  q: number;
  r: number;
  id: string;
}

export const StaticSentry: React.FC<EnemyProps> = ({ id }) => {
  const meshRef = useRef<THREE.Group>(null);
  const projectileRef = useRef<THREE.Mesh>(null);
  const lastFire = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.02;

    const now = state.clock.getElapsedTime();
    if (now - lastFire.current > 3) {
      lastFire.current = now;
      if (projectileRef.current) {
          projectileRef.current.position.set(0, 0, 0);
          projectileRef.current.visible = true;
      }
    }

    if (projectileRef.current && projectileRef.current.visible) {
        projectileRef.current.position.z += 0.05;
        if (projectileRef.current.position.z > 10) projectileRef.current.visible = false;

        // Simple collision
        const pPos = useGameStore.getState().playerPosition;
        const projWorldPos = new THREE.Vector3();
        projectileRef.current.getWorldPosition(projWorldPos);
        if (projWorldPos.distanceTo(new THREE.Vector3(...pPos)) < 0.5) {
            useGameStore.getState().damagePlayer(5);
            projectileRef.current.visible = false;
        }
    }
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <octahedronGeometry args={[0.4]} />
        <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={1} />
      </mesh>
      <mesh ref={projectileRef} visible={false}>
          <sphereGeometry args={[0.1]} />
          <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={5} />
      </mesh>
    </group>
  );
};

export const Orbiter: React.FC<EnemyProps & { radius: number, id: string }> = ({ radius, id }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.x = Math.cos(t) * radius;
    meshRef.current.position.z = Math.sin(t) * radius;

    // Collision check
    const pPos = useGameStore.getState().playerPosition;
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);
    if (worldPos.distanceTo(new THREE.Vector3(...pPos)) < 0.6) {
        const game = useGameStore.getState();
        if (game.isSiphonDashing) {
            game.siphonHeal();
        } else {
            game.damagePlayer(10);
        }
        game.collectEntity(id);
    }
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <torusGeometry args={[0.3, 0.1, 12, 24]} />
        <meshStandardMaterial color="#008080" emissive="#008080" />
      </mesh>
    </group>
  );
};

export const Sweeper: React.FC<EnemyProps & { id: string }> = ({ id }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Linear traverse logic
    meshRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 0.5) * 5;

    // Collision check
    const pPos = useGameStore.getState().playerPosition;
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);
    if (worldPos.distanceTo(new THREE.Vector3(...pPos)) < 0.6) {
        const game = useGameStore.getState();
        if (game.isSiphonDashing) {
            game.siphonHeal();
        } else {
            game.damagePlayer(10);
        }
        game.collectEntity(id);
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#00FFFF" />
    </mesh>
  );
};
