import React from 'react';
import { useGameStore, type Entity } from '../store/useGameStore';
import { StaticSentry, Orbiter, Sweeper } from './enemies/Tier1';
import { EchoHunter, MineLayer, Tether } from './enemies/Tier2';
import { PhaseShifter, GravitySentinel, MirrorDrone } from './enemies/Tier3';

const Shard: React.FC<{ position: [number, number, number] }> = ({ position }) => (
  <mesh position={position}>
    <octahedronGeometry args={[0.3]} />
    <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={2} />
  </mesh>
);

const EntityManager: React.FC = () => {
  const entities = useGameStore((state) => state.entities);

  return (
    <group>
      {entities.map((entity: Entity) => {
        const [x, y, z] = entity.position;

        // Simple heuristic to determine which enemy subtype to render
        // In a more complex game, we'd store the subtype in the entity object
        const seed = parseInt(entity.id.split('-').pop() || '0');

        switch (entity.type) {
          case 'SHARD':
            return <Shard key={entity.id} position={entity.position} />;

          case 'ENEMY_T1':
            return (
                <group key={entity.id} position={[x, y, z]}>
                    {seed % 3 === 0 ? <StaticSentry q={0} r={0} /> : seed % 3 === 1 ? <Orbiter q={0} r={0} radius={2} /> : <Sweeper q={0} r={0} />}
                </group>
            );

          case 'ENEMY_T2':
            return (
                <group key={entity.id} position={[x, y, z]}>
                    {seed % 3 === 0 ? (
                        <EchoHunter q={0} r={0} />
                    ) : seed % 3 === 1 ? (
                        <MineLayer q={0} r={0} />
                    ) : (
                        <Tether posA={[-1, -1]} posB={[1, 1]} />
                    )}
                </group>
            );

          case 'ENEMY_T3':
            return (
                <group key={entity.id} position={[x, y, z]}>
                    {seed % 3 === 0 ? <PhaseShifter q={0} r={0} /> : seed % 3 === 1 ? <GravitySentinel q={0} r={0} /> : <MirrorDrone q={0} r={0} />}
                </group>
            );

          default:
            return null;
        }
      })}
    </group>
  );
};

export default EntityManager;
