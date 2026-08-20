import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/useGameStore';

interface EnemyProps {
  q: number;
  r: number;
  id?: string;
}

export const StaticSentry: React.FC<EnemyProps> = () => {
  const meshRef = useRef<THREE.Group>(null);
  const projectileRef = useRef<THREE.Mesh>(null);
  const lastFire = useRef(0);

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.04; // Faster spin

    const now = state.clock.getElapsedTime();
    if (now - lastFire.current > 1.8) { // Faster firing rate
      lastFire.current = now;
      if (projectileRef.current) {
          projectileRef.current.position.set(0, 0, 0);
          projectileRef.current.visible = true;
      }
    }

    if (projectileRef.current && projectileRef.current.visible) {
        projectileRef.current.position.z += 0.12; // Faster projectile
        if (projectileRef.current.position.z > 12) projectileRef.current.visible = false;

        // Simple collision
        const pPos = useGameStore.getState().playerPosition;
        const projWorldPos = new THREE.Vector3();
        projectileRef.current.getWorldPosition(projWorldPos);
        if (projWorldPos.distanceTo(new THREE.Vector3(...pPos)) < 0.8) {
            useGameStore.getState().damagePlayer(10);
            projectileRef.current.visible = false;
        }
    }
  });

  return (
    <group ref={meshRef} scale={[1.8, 1.8, 1.8]}>
      <mesh>
        <octahedronGeometry args={[0.5]} />
        <meshStandardMaterial color="#FF0033" emissive="#FF0000" emissiveIntensity={2} />
      </mesh>
      <mesh ref={projectileRef} visible={false}>
          <sphereGeometry args={[0.2]} />
          <meshStandardMaterial color="#FF0000" emissive="#FF0000" emissiveIntensity={5} />
      </mesh>
    </group>
  );
};

export const Orbiter: React.FC<EnemyProps & { radius: number, id: string }> = ({ radius }) => {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime() * 1.8; // Faster orbit
    meshRef.current.position.x = Math.cos(t) * (radius * 1.2);
    meshRef.current.position.z = Math.sin(t) * (radius * 1.2);

    // Collision check
    const pPos = useGameStore.getState().playerPosition;
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);
    if (worldPos.distanceTo(new THREE.Vector3(...pPos)) < 0.9) {
        const game = useGameStore.getState();
        if (game.isSiphonDashing) {
            game.siphonHeal();
        } else {
            game.damagePlayer(15);
        }
        // Respawn position instead of disappearing permanently
        meshRef.current.position.x = (Math.random() - 0.5) * 10;
        meshRef.current.position.z = (Math.random() - 0.5) * 10;
    }
  });

  return (
    <group ref={meshRef} scale={[1.8, 1.8, 1.8]}>
      <mesh>
        <torusGeometry args={[0.4, 0.15, 12, 24]} />
        <meshStandardMaterial color="#FF0033" emissive="#FF0000" emissiveIntensity={2} />
      </mesh>
    </group>
  );
};

export const Sweeper: React.FC<EnemyProps & { id: string }> = () => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    // Faster linear sweep
    meshRef.current.position.x = Math.sin(state.clock.getElapsedTime() * 1.5) * 7;

    // Collision check
    const pPos = useGameStore.getState().playerPosition;
    const worldPos = new THREE.Vector3();
    meshRef.current.getWorldPosition(worldPos);
    if (worldPos.distanceTo(new THREE.Vector3(...pPos)) < 0.9) {
        const game = useGameStore.getState();
        if (game.isSiphonDashing) {
            game.siphonHeal();
        } else {
            game.damagePlayer(15);
        }
        // Reposition on hit so combat stays active
        meshRef.current.position.x = (Math.random() - 0.5) * 12;
    }
  });

  return (
    <mesh ref={meshRef} scale={[1.8, 1.8, 1.8]}>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color="#FF0033" emissive="#FF0000" emissiveIntensity={2} />
    </mesh>
  );
};
