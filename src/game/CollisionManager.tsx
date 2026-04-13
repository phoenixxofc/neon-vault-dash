import { useFrame } from '@react-three/fiber';
import { useGameStore, type Entity } from '../store/useGameStore';
import * as THREE from 'three';

const CollisionManager: React.FC<{ playerRef: React.RefObject<THREE.Group> }> = ({ playerRef }) => {
  const {
    damagePlayer,
    addShards,
    entities,
    collectEntity,
    gameState,
    calculateSync
  } = useGameStore();

  useFrame(() => {
    if (!playerRef.current || gameState !== 'PLAYING') return;

    const playerPos = playerRef.current.position;
    const playerHitboxRadius = 0.4;

    entities.forEach((entity: Entity) => {
      const entityPos = new THREE.Vector3(...entity.position);
      const distance = playerPos.distanceTo(entityPos);

      if (distance < playerHitboxRadius + 0.3) {
        if (entity.type === 'SHARD') {
          addShards(1);
          collectEntity(entity.id);
          calculateSync();
        } else if (entity.type.startsWith('ENEMY')) {
          damagePlayer(10);
          collectEntity(entity.id);
          calculateSync();
        }
      }
    });
  });

  return null;
};

export default CollisionManager;
