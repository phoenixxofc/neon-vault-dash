import { create } from 'zustand';

export interface Entity {
  id: string;
  type: 'SHARD' | 'ENEMY_T1' | 'ENEMY_T2' | 'ENEMY_T3' | 'GREEN_HEX';
  position: [number, number, number];
  collected?: boolean;
}

interface GameState {
  playerIntegrity: number;
  currentLevel: number;
  collectedShards: number;
  totalShards: number;
  syncValue: number;
  gameState: 'MENU' | 'LOADING' | 'PLAYING' | 'FORGE' | 'GAMEOVER';
  entities: Entity[];
  equippedParts: {
    trail: string;
    chassis: string;
    thrusters: string;
    core: string;
    plating: string;
  };

  // Actions
  setGameState: (state: 'MENU' | 'LOADING' | 'PLAYING' | 'FORGE' | 'GAMEOVER') => void;
  damagePlayer: (amount: number) => void;
  repairPlayer: (amount: number, cost: number) => void;
  addShards: (amount: number) => void;
  completeLevel: () => void;
  calculateSync: (isWarningDash?: boolean) => void;
  siphonHeal: () => void;
  spawnEntities: (level: number) => void;
  collectEntity: (id: string) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  playerIntegrity: 100,
  currentLevel: 1,
  collectedShards: 0,
  totalShards: 0,
  syncValue: 0,
  gameState: 'MENU',
  entities: [],
  equippedParts: {
    trail: '#00FFFF',
    chassis: 'MK3_DEFAULT',
    thrusters: 'MK3_DEFAULT',
    core: 'MK3_DEFAULT',
    plating: 'MK3_DEFAULT',
  },

  setGameState: (state) => set({ gameState: state }),

  damagePlayer: (amount) => set((state) => {
    const newIntegrity = Math.max(0, state.playerIntegrity - amount);
    return {
      playerIntegrity: newIntegrity,
      gameState: newIntegrity <= 0 ? 'GAMEOVER' : state.gameState
    };
  }),

  repairPlayer: (amount, cost) => set((state) => ({
    playerIntegrity: Math.min(100, state.playerIntegrity + amount),
    collectedShards: state.collectedShards - cost
  })),

  addShards: (amount) => set((state) => ({
    collectedShards: state.collectedShards + amount,
    totalShards: state.totalShards + amount
  })),

  completeLevel: () => set((state) => ({
    currentLevel: state.currentLevel + 1,
    gameState: (state.currentLevel + 1) % 5 === 0 ? 'FORGE' : 'PLAYING'
  })),

  calculateSync: (isWarningDash = false) => set((state) => {
    let S = (state.currentLevel * 1000) + (state.totalShards * 10) + (state.playerIntegrity * 50);
    if (isWarningDash) {
      S = Math.floor(S * 1.5);
    }
    return { syncValue: S };
  }),

  siphonHeal: () => set((state) => ({
    playerIntegrity: Math.min(100, state.playerIntegrity + 5)
  })),

  spawnEntities: (level) => set(() => {
    const newEntities: Entity[] = [];
    const shardCount = 5 + level;
    for (let i = 0; i < shardCount; i++) {
      newEntities.push({
        id: `shard-${level}-${i}`,
        type: 'SHARD',
        position: [(Math.random() - 0.5) * 15, 0.5, (Math.random() - 0.5) * 15]
      });
    }
    return { entities: newEntities };
  }),

  collectEntity: (id) => set((state) => ({
    entities: state.entities.filter(e => e.id !== id)
  })),

  resetGame: () => set({
    playerIntegrity: 100,
    currentLevel: 1,
    collectedShards: 0,
    totalShards: 0,
    syncValue: 0,
    gameState: 'MENU',
    entities: []
  }),
}));
