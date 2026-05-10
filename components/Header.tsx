/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { useUI } from '../lib/state';
import { Settings } from 'lucide-react';
import { motion } from 'motion/react';

export default function Header() {
  const { toggleSidebar } = useUI();

  return (
    <header className="flex items-center justify-between px-6 h-20 bg-transparent fixed top-0 w-full z-[80] transition-all pointer-events-none">
      <div className="flex items-center gap-4 pointer-events-auto">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-11 h-11 bg-gradient-to-br from-[#1c1c1f] to-[#141416] rounded-xl flex items-center justify-center shadow-lg border border-[#27272a]/50"
        >
          <img src="https://eburon.ai/icon-eburon.svg" alt="Eburon" className="w-7 h-7" />
        </motion.div>
        <div className="hidden sm:block">
          <h1 className="text-sm font-bold text-white tracking-widest uppercase">
            Multilinguahe
          </h1>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">AI POWERED</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pointer-events-auto">
        <div className="flex items-center gap-1 bg-[#121214] p-1 rounded-xl border border-[#1f1f22]">
          <button
            onClick={toggleSidebar}
            className="p-2 text-[#71717a] hover:text-white hover:bg-[#1f1f22] rounded-lg transition-all"
            title="Menu"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
