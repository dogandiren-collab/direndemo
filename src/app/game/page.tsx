'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '@/components/BottomNav';
import RainEffect from '@/components/RainEffect';

type Upgrade = {
  id: string;
  name: string;
  desc: string;
  cost: number;
  dps: number; // Dert per second
  dpc: number; // Dert per click
  owned: number;
  emoji: string;
};

const INITIAL_UPGRADES: Upgrade[] = [
  { id: 'u1', name: 'Soğuk Çay', desc: '+1 Dert/Tık', cost: 20, dps: 0, dpc: 1, owned: 0, emoji: '🫖' },
  { id: 'u2', name: 'Kira Zammı', desc: '+2 Dert/sn', cost: 50, dps: 2, dpc: 0, owned: 0, emoji: '💸' },
  { id: 'u3', name: 'Görüldü Atılması', desc: '+5 Dert/sn', cost: 150, dps: 5, dpc: 0, owned: 0, emoji: '👁️' },
  { id: 'u4', name: 'Kredi Kartı Asgarisi', desc: '+15 Dert/sn', cost: 500, dps: 15, dpc: 0, owned: 0, emoji: '💳' },
  { id: 'u5', name: 'Terk Edilme', desc: '+50 Dert/sn', cost: 2000, dps: 50, dpc: 0, owned: 0, emoji: '💔' },
];

export default function GamePage() {
  const [dert, setDert] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES);

  const dpc = 1 + upgrades.reduce((acc, u) => acc + (u.dpc * u.owned), 0);
  const dps = upgrades.reduce((acc, u) => acc + (u.dps * u.owned), 0);

  // Auto Dert Generation
  useEffect(() => {
    if (dps === 0) return;
    const interval = setInterval(() => {
      setDert(prev => prev + (dps / 10)); // run every 100ms
    }, 100);
    return () => clearInterval(interval);
  }, [dps]);

  // Floating text animation state
  const [clicks, setClicks] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setDert(prev => prev + dpc);
    setTotalClicks(prev => prev + 1);
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const id = Date.now();
    setClicks(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== id));
    }, 1000);
  };

  const buyUpgrade = (id: string) => {
    const upgrade = upgrades.find(u => u.id === id);
    if (!upgrade || dert < upgrade.cost) return;

    setDert(prev => prev - upgrade.cost);
    setUpgrades(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, owned: u.owned + 1, cost: Math.floor(u.cost * 1.15) };
      }
      return u;
    }));
  };

  return (
    <div className="min-h-screen bg-bg-dark pb-safe relative overflow-hidden">
      <RainEffect />
      
      <div className="max-w-md mx-auto px-4 pt-12 relative z-10 flex flex-col h-[calc(100vh-70px)]">
        
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-[var(--font-heading)] font-bold text-text-primary mb-2">Gariban Clicker</h1>
          <p className="text-text-muted text-sm">Hayat zor, tıklamak bedava.</p>
        </div>

        {/* SCORE BOARD */}
        <div className="glass-card p-6 rounded-2xl mb-8 text-center border-glow-gold relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-dirty-gold/5 to-transparent opacity-50" />
          <div className="text-sm text-dirty-gold font-medium mb-1 relative z-10">TOPLAM DERT</div>
          <div className="text-5xl font-bold font-[var(--font-heading)] text-gradient-gold mb-2 relative z-10">
            {Math.floor(dert).toLocaleString('tr-TR')}
          </div>
          <div className="flex justify-center gap-4 text-xs text-text-muted relative z-10">
            <span>Tık Başına: {dpc}</span>
            <span>•</span>
            <span>Saniyede: {dps}</span>
          </div>
        </div>

        {/* CLICKER BUTTON */}
        <div className="flex-1 flex items-center justify-center mb-8">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleClick}
            className="relative w-40 h-40 rounded-full bg-charcoal border-2 border-white/10 shadow-[0_0_40px_rgba(255,255,255,0.05)] flex items-center justify-center text-7xl select-none focus:outline-none"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-dirty-gold/10 to-transparent" />
            🫠
            {/* FLOATING CLICKS */}
            {clicks.map(click => (
              <motion.div
                key={click.id}
                initial={{ opacity: 1, y: click.y - 20, x: click.x - 20, scale: 0.5 }}
                animate={{ opacity: 0, y: click.y - 100, scale: 1.2 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute text-sm font-bold text-dirty-gold pointer-events-none"
              >
                +{dpc}
              </motion.div>
            ))}
          </motion.button>
        </div>

        {/* UPGRADES STORE */}
        <div className="bg-black/40 rounded-t-3xl border-t border-white/10 flex-1 overflow-y-auto no-scrollbar -mx-4 px-4 pt-6 pb-6">
          <h2 className="text-sm font-medium text-text-secondary uppercase tracking-wider mb-4 px-2">Dert Pazarı</h2>
          <div className="space-y-3">
            {upgrades.map(u => {
              const canAfford = dert >= u.cost;
              return (
                <button
                  key={u.id}
                  onClick={() => buyUpgrade(u.id)}
                  disabled={!canAfford}
                  className={`w-full text-left glass p-4 flex items-center gap-4 transition-all ${
                    canAfford ? 'hover:bg-white/5 active:scale-[0.98]' : 'opacity-50 grayscale'
                  }`}
                >
                  <div className="text-3xl bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center shrink-0">
                    {u.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-text-primary flex items-center justify-between">
                      <span>{u.name}</span>
                      <span className="text-xs bg-white/10 px-2 py-0.5 rounded-full">{u.owned}x</span>
                    </div>
                    <div className="text-xs text-text-muted mt-1">{u.desc}</div>
                  </div>
                  <div className={`font-bold ${canAfford ? 'text-dirty-gold' : 'text-text-muted'} whitespace-nowrap`}>
                    {u.cost.toLocaleString('tr-TR')} 💸
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      <BottomNav active="game" />
    </div>
  );
}
