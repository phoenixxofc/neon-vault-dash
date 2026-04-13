import React, { useMemo } from 'react';
import { useGameStore } from '../store/useGameStore';
import HexTile from './HexTile';
import { getHexKey } from '../utils/hexGrid';

const Arena: React.FC = () => {
  const currentLevel = useGameStore((state) => state.currentLevel);

  const tiles = useMemo(() => {
    const radius = 5 + Math.floor(currentLevel / 5);
    const tileList: { q: number; r: number }[] = [];

    for (let q = -radius; q <= radius; q++) {
      const r1 = Math.max(-radius, -q - radius);
      const r2 = Math.min(radius, -q + radius);
      for (let r = r1; r <= r2; r++) {
        tileList.push({ q, r });
      }
    }
    return tileList;
  }, [currentLevel]);

  return (
    <group>
      {tiles.map((tile) => (
        <HexTile
          key={getHexKey(tile.q, tile.r)}
          q={tile.q}
          r={tile.r}
        />
      ))}
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#00FFFF" />
    </group>
  );
};

export default Arena;
