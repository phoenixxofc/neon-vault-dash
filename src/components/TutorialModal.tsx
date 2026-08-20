import React, { useState } from 'react';

interface TutorialModalProps {
  onClose: () => void;
}

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleStart = () => {
    if (dontShowAgain) {
      localStorage.setItem('neon_vault_skip_tutorial', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 font-mono p-6">
      <div className="w-full max-w-2xl bg-[#09090d] border-2 border-neon-cyan p-8 text-white shadow-[0_0_30px_#00FFFF40] rounded-lg">
        <h2 className="text-3xl font-bold text-neon-cyan mb-4 tracking-tighter text-center">
          NEON_VAULT_DASH // HOW_TO_PLAY
        </h2>

        <div className="space-y-4 text-sm text-gray-200">
          <div className="bg-black/60 border border-neon-cyan/40 p-4 rounded">
            <h3 className="text-neon-cyan font-bold mb-2">🎮 CONTROLS & BINDINGS</h3>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li><span className="text-neon-yellow">Aim / Rotate</span>: Move Mouse Cursor across arena</li>
              <li><span className="text-neon-yellow">Standard Dash</span>: Hold & Release <span className="text-white font-bold">Left Click (LMB)</span></li>
              <li><span className="text-neon-yellow">Siphon Dash</span>: <span className="text-white font-bold">Spacebar</span>, <span className="text-white font-bold">Shift</span>, <span className="text-white font-bold">E key</span>, or <span className="text-white font-bold">Right Click (RMB)</span></li>
            </ul>
          </div>

          <div className="bg-black/60 border border-neon-magenta/40 p-4 rounded">
            <h3 className="text-neon-magenta font-bold mb-2">🎯 OBJECTIVE & MECHANICS</h3>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Collect glowing <span className="text-neon-cyan">Cyan Shards</span> to clear levels and descend into the Vault.</li>
              <li>Avoid <span className="text-red-500 font-bold">Red Enemies</span> or perform <span className="text-neon-cyan">Siphon Dash</span> through them to recover HP!</li>
              <li>Steer clear of falling <span className="text-yellow-400">Warning Tiles</span> into the VOID. Dashing off warning tiles gives <span className="text-neon-yellow">1.5x Sync Score</span>.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={(e) => setDontShowAgain(e.target.checked)}
              className="accent-neon-cyan w-4 h-4 cursor-pointer"
            />
            <span>DO NOT SHOW AGAIN</span>
          </label>

          <button
            onClick={handleStart}
            className="px-8 py-3 bg-neon-cyan text-black font-bold tracking-wider hover:bg-white transition-all shadow-[0_0_15px_#00FFFF]"
          >
            ENTER_VAULT
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialModal;
