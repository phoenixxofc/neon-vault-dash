import { useFrame } from '@react-three/fiber';
import { useGameStore, type Entity } from '../store/useGameStore';
import * as THREE from 'three';

const CollisionManager: React.FC<{ playerRef: React.RefObject<THREE.Group> }> = ({ playerRef }) => {
  useFrame(() => {
    const state = useGameStore.getState();
    if (!playerRef.current || state.gameState !== 'PLAYING') return;

    const playerPos = playerRef.current.position;
    const playerHitboxRadius = 0.4;

    state.entities.forEach((entity: Entity) => {
      const entityPos = new THREE.Vector3(...entity.position);
      const distance = playerPos.distanceTo(entityPos);

      if (distance < playerHitboxRadius + 0.3) {
        if (entity.type === 'SHARD') {
          state.addShards(1);
          state.collectEntity(entity.id);
          state.calculateSync();

          // Check if level clear
          const remainingShards = state.entities.filter(e => e.type === 'SHARD' && e.id !== entity.id).length;
          if (remainingShards === 0) {
              state.completeLevel();
          }
        } else if (entity.type.startsWith('ENEMY')) {
          if (state.isSiphonDashing && entity.type === 'ENEMY_T1') {
            state.siphonHeal();
          } else {
            state.damagePlayer(10);
          }
          state.collectEntity(entity.id);
          state.calculateSync();
        }
      }
    });
  });

  return null;
};

export default CollisionManager;
