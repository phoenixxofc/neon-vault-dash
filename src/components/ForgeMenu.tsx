import React from 'react';
import { useGameStore } from '../store/useGameStore';

const ForgeMenu: React.FC = () => {
  const { collectedShards, setGameState, repairPlayer } = useGameStore();

  return (
    <div className="fixed inset-0 bg-void-black/90 flex items-center justify-center z-40 crt">
      <div className="w-[680px] border-2 border-neon-yellow p-8 bg-black shadow-[0_0_30px_rgba(255,255,0,0.2)]">
        <h2 className="text-4xl font-mono text-neon-yellow mb-6 tracking-tighter text-center">THE_FORGE_CHECKPOINT</h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setGameState('PLAYING')}
            className="group border border-neon-cyan p-4 hover:bg-neon-cyan/20 transition-all text-left"
          >
            <div className="text-neon-cyan text-xs font-mono">OPTION_A</div>
            <div className="text-white text-lg font-bold">DOUBLE DOWN</div>
            <div className="text-neon-cyan/60 text-xs mt-1 italic">Continue to next level for 2x score multiplier.</div>
          </button>

          <button
            onClick={() => {
              repairPlayer(50, Math.min(collectedShards, 10));
              setGameState('PLAYING');
            }}
            disabled={collectedShards < 5}
            className="group border border-neon-magenta p-4 hover:bg-neon-magenta/20 transition-all text-left disabled:opacity-50"
          >
            <div className="text-neon-magenta text-xs font-mono">OPTION_B</div>
            <div className="text-white text-lg font-bold">REPAIR_RIG (+50 HP)</div>
            <div className="text-neon-magenta/60 text-xs mt-1 italic">Spend 10 shards to restore 50 HP.</div>
          </button>

          <button
            onClick={() => {
              useGameStore.getState().addShards(5);
              setGameState('PLAYING');
            }}
            className="group border border-neon-yellow p-4 hover:bg-neon-yellow/20 transition-all text-left"
          >
            <div className="text-neon-yellow text-xs font-mono">OPTION_C</div>
            <div className="text-white text-lg font-bold">SHARD HARVEST (+5)</div>
            <div className="text-neon-yellow/60 text-xs mt-1 italic">Harvest 5 bonus shards immediately.</div>
          </button>

          <button
            onClick={() => setGameState('MENU')}
            className="group border border-neon-teal p-4 hover:bg-neon-teal/20 transition-all text-left"
          >
            <div className="text-neon-teal text-xs font-mono">OPTION_D</div>
            <div className="text-white text-lg font-bold">EXIT_RUN</div>
            <div className="text-neon-teal/60 text-xs mt-1 italic">Save shards and exit to main menu.</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgeMenu;
