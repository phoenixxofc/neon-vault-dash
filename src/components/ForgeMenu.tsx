import React from 'react';
import { useGameStore } from '../store/useGameStore';

const ForgeMenu: React.FC = () => {
  const { collectedShards, setGameState, repairPlayer } = useGameStore();

  return (
    <div className="fixed inset-0 bg-void-black/90 flex items-center justify-center z-40 crt">
      <div className="w-[600px] border-2 border-neon-yellow p-10 bg-black shadow-[0_0_30px_rgba(255,255,0,0.2)]">
        <h2 className="text-4xl font-mono text-neon-yellow mb-8 tracking-tighter">THE_FORGE_CHECKPOINT</h2>

        <div className="grid grid-cols-1 gap-6">
          <button
            onClick={() => setGameState('PLAYING')}
            className="group border border-neon-cyan p-4 hover:bg-neon-cyan/20 transition-all text-left"
          >
            <div className="text-neon-cyan text-sm font-mono">OPTION_A</div>
            <div className="text-white text-xl">DOUBLE DOWN</div>
            <div className="text-neon-cyan/60 text-xs mt-1 italic">Continue to next level for 2x multiplier.</div>
          </button>

          <button
            onClick={() => repairPlayer(40, Math.floor(collectedShards * 0.5))}
            disabled={collectedShards < 10}
            className="group border border-neon-magenta p-4 hover:bg-neon-magenta/20 transition-all text-left disabled:opacity-50"
          >
            <div className="text-neon-magenta text-sm font-mono">OPTION_B</div>
            <div className="text-white text-xl">REPAIR_RIG</div>
            <div className="text-neon-magenta/60 text-xs mt-1 italic">Deduct 50% shards to restore 40 integrity.</div>
          </button>

          <button
            onClick={() => setGameState('MENU')}
            className="group border border-neon-teal p-4 hover:bg-neon-teal/20 transition-all text-left"
          >
            <div className="text-neon-teal text-sm font-mono">OPTION_C</div>
            <div className="text-white text-xl">EXTRACT_DATA</div>
            <div className="text-neon-teal/60 text-xs mt-1 italic">Mint collected $SHARD and end run.</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgeMenu;
