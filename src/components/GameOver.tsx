import React from 'react';
import { useGameStore } from '../store/useGameStore';

const GameOver: React.FC = () => {
  const { syncValue, currentLevel, resetGame } = useGameStore();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center z-[200] bg-black/90 font-mono p-10 text-center">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle,rgba(255,0,0,0.15)_0%,transparent_70%)]" />

      <h1 className="text-7xl font-bold text-neon-red mb-4 tracking-tighter animate-pulse">
        INTEGRITY_COMPROMISED
      </h1>
      <p className="text-neon-red/60 text-xl mb-12 tracking-widest uppercase">
        Neural Link Severed // Data Shards Lost
      </p>

      <div className="grid grid-cols-2 gap-8 mb-16 max-w-md w-full">
        <div className="border border-neon-red/30 p-4 bg-red-900/5">
          <div className="text-[10px] text-neon-red mb-1 opacity-50">SYNC_VALUE</div>
          <div className="text-3xl text-white font-bold">{syncValue.toLocaleString()}</div>
        </div>
        <div className="border border-neon-red/30 p-4 bg-red-900/5">
          <div className="text-[10px] text-neon-red mb-1 opacity-50">DEPTH_REACHED</div>
          <div className="text-3xl text-white font-bold">LVL_{currentLevel}</div>
        </div>
      </div>

      <button
        onClick={() => {
            console.log("[SYSTEM] Re-initializing Neural Link...");
            resetGame();
        }}
        className="px-12 py-4 border-2 border-neon-red text-neon-red text-2xl hover:bg-neon-red hover:text-black transition-all duration-300 shadow-[0_0_20px_#FF0000] uppercase tracking-tighter"
      >
        RE-INITIALIZE_LINK
      </button>

      <div className="mt-20 text-[10px] text-white/20 tracking-[0.5em]">
        SYSTEM_ERROR_CODE: RIG_COLLAPSE_VOX_84
      </div>
    </div>
  );
};

export default GameOver;
