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
    durability: number;
  };
  useGamepad: boolean;
  isSiphonDashing: boolean;
  isOnWarningTile: boolean;
  playerPosition: [number, number, number];
  externalForce: [number, number, number];

  // Actions
  setGameState: (state: 'MENU' | 'LOADING' | 'PLAYING' | 'FORGE' | 'GAMEOVER') => void;
  damagePlayer: (amount: number) => void;
  decrementDurability: (amount: number) => void;
  repairPlayer: (amount: number, cost: number) => void;
  addShards: (amount: number) => void;
  completeLevel: () => void;
  calculateSync: (isWarningDash?: boolean) => void;
  siphonHeal: () => void;
  setSiphonDashing: (val: boolean) => void;
  setIsOnWarningTile: (val: boolean) => void;
  setPlayerPosition: (pos: [number, number, number]) => void;
  applyExternalForce: (force: [number, number, number]) => void;
  resetExternalForce: () => void;
  greenHexHeal: () => void;
  spawnEntities: (level: number) => void;
  collectEntity: (id: string) => void;
  setUseGamepad: (val: boolean) => void;
  tickIntegrityDecay: (delta: number) => void;
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
    durability: 100,
  },
  useGamepad: false,
  isSiphonDashing: false,
  isOnWarningTile: false,
  playerPosition: [0, 0.5, 0],
  externalForce: [0, 0, 0],

  setGameState: (state) => set({ gameState: state }),

  damagePlayer: (amount) => set((state) => {
    const newIntegrity = Math.max(0, state.playerIntegrity - amount);
    // Also decrement durability as per req
    const newDurability = Math.max(0, state.equippedParts.durability - 1);
    return {
      playerIntegrity: newIntegrity,
      gameState: newIntegrity <= 0 ? 'GAMEOVER' : state.gameState,
      equippedParts: { ...state.equippedParts, durability: newDurability }
    };
  }),

  decrementDurability: (amount) => set((state) => ({
    equippedParts: { ...state.equippedParts, durability: Math.max(0, state.equippedParts.durability - amount) }
  })),

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
    const L = state.currentLevel;
    const D = state.totalShards;
    const I = state.playerIntegrity;

    // Formula: S = (L * 1000) + (D * 10) + (I * 50)
    let S = (L * 1000) + (D * 10) + (I * 50);

    if (isWarningDash) {
      S = Math.floor(S * 1.5);
    }

    if (state.useGamepad) {
      S = Math.floor(S * 0.8);
    }

    return { syncValue: S };
  }),

  siphonHeal: () => set((state) => ({
    playerIntegrity: Math.min(100, state.playerIntegrity + 5)
  })),

  setSiphonDashing: (val: boolean) => set({ isSiphonDashing: val }),
  setIsOnWarningTile: (val: boolean) => set({ isOnWarningTile: val }),
  setPlayerPosition: (pos: [number, number, number]) => set({ playerPosition: pos }),
  applyExternalForce: (force: [number, number, number]) => set((state) => ({
      externalForce: [
          state.externalForce[0] + force[0],
          state.externalForce[1] + force[1],
          state.externalForce[2] + force[2]
      ]
  })),
  resetExternalForce: () => set({ externalForce: [0, 0, 0] }),
  greenHexHeal: () => set((state) => ({
    playerIntegrity: Math.min(100, state.playerIntegrity + 15)
  })),

  spawnEntities: (level) => set(() => {
    const newEntities: Entity[] = [];

    // Spawning Shards
    const shardCount = 5 + Math.floor(level / 2);
    for (let i = 0; i < shardCount; i++) {
      newEntities.push({
        id: `shard-${level}-${i}`,
        type: 'SHARD',
        position: [(Math.random() - 0.5) * 20, 0.5, (Math.random() - 0.5) * 20]
      });
    }

    // Spawning Enemies based on Tiers
    if (level >= 1) {
        // Tier 1: Levels 1-10 (and up)
        const t1Count = Math.min(5, Math.ceil(level / 2));
        for (let i = 0; i < t1Count; i++) {
            newEntities.push({
                id: `enemy-t1-${level}-${i}`,
                type: 'ENEMY_T1',
                position: [(Math.random() - 0.5) * 20, 0.5, (Math.random() - 0.5) * 20]
            });
        }
    }

    if (level >= 11) {
        // Tier 2: Levels 11-20 (and up)
        const t2Count = Math.min(3, Math.ceil((level - 10) / 3));
        for (let i = 0; i < t2Count; i++) {
            newEntities.push({
                id: `enemy-t2-${level}-${i}`,
                type: 'ENEMY_T2',
                position: [(Math.random() - 0.5) * 20, 0.5, (Math.random() - 0.5) * 20]
            });
        }
    }

    if (level >= 21) {
        // Tier 3: Levels 21+
        const t3Count = Math.min(2, Math.ceil((level - 20) / 5));
        for (let i = 0; i < t3Count; i++) {
            newEntities.push({
                id: `enemy-t3-${level}-${i}`,
                type: 'ENEMY_T3',
                position: [(Math.random() - 0.5) * 20, 0.5, (Math.random() - 0.5) * 20]
            });
        }
    }

    return { entities: newEntities };
  }),

  collectEntity: (id) => set((state) => ({
    entities: state.entities.filter(e => e.id !== id)
  })),

  setUseGamepad: (val) => set({ useGamepad: val }),

  tickIntegrityDecay: (delta) => set((state) => {
    if (state.currentLevel >= 30 && state.gameState === 'PLAYING') {
        const decay = 0.5 * delta;
        return { playerIntegrity: Math.max(0, state.playerIntegrity - decay) };
    }
    return {};
  }),

  resetGame: () => set({
    playerIntegrity: 100,
    currentLevel: 1,
    collectedShards: 0,
    totalShards: 0,
    syncValue: 0,
    gameState: 'MENU',
    entities: [],
    useGamepad: false
  }),
}));

if (typeof window !== 'undefined') {
  (window as any).useGameStore = useGameStore;
}
