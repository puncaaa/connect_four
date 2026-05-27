"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trophy, MapPin, Medal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGameStore } from '@/store/gameStore';

interface LeaderboardEntry {
  id: string;
  username: string;
  location: string;
  wins: number;
  rank: number;
}

export default function Leaderboard() {
  const { userProfile } = useGameStore();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState('Global');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // With Supabase, we would fetch global profiles here.
    // Since we are strictly removing mock accounts, we only show the actual logged-in user for now.
    const realEntries: LeaderboardEntry[] = [];
    
    if (userProfile) {
      realEntries.push({
        id: userProfile.id,
        username: userProfile.username,
        location: userProfile.location,
        wins: userProfile.wins,
        rank: 1
      });
    }

    if (filter === 'Global') {
      setEntries(realEntries);
    } else {
      setEntries(realEntries.filter(e => e.location === filter));
    }
  }, [filter, userProfile]);

  return (
    <div className="glass-panel rounded-2xl p-6 w-full max-w-sm shrink-0 flex flex-col max-h-[500px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 uppercase tracking-wider text-white/70">
          <Trophy className="w-5 h-5 text-yellow-400" /> Leaderboard
        </h2>
        <select 
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-dark-bg border border-white/10 rounded-lg px-2 py-1 text-sm text-white outline-none focus:border-neon-cyan"
        >
          <option value="Global">Global</option>
          <option value="Almaty">Almaty</option>
          <option value="Astana">Astana</option>
          <option value="KBTU">KBTU</option>
          <option value="NU">NU</option>
        </select>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="text-center text-white/50 py-4">Syncing network...</div>
        ) : entries.length === 0 ? (
          <div className="text-center text-white/50 py-4">No operatives found in sector.</div>
        ) : (
          entries.map((entry, index) => (
            <div 
              key={entry.id} 
              className={cn(
                "flex items-center justify-between p-3 rounded-xl border transition-colors",
                index === 0 ? "bg-yellow-400/10 border-yellow-400/30" : 
                index === 1 ? "bg-gray-300/10 border-gray-300/30" :
                index === 2 ? "bg-amber-700/10 border-amber-700/30" :
                "bg-white/5 border-white/5 hover:bg-white/10"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
                  index === 0 ? "bg-yellow-400 text-black shadow-[0_0_10px_rgba(250,204,21,0.5)]" : 
                  index === 1 ? "bg-gray-300 text-black" :
                  index === 2 ? "bg-amber-700 text-white" :
                  "bg-dark-bg text-white/70"
                )}>
                  {index + 1}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{entry.username}</div>
                  <div className="flex items-center gap-1 text-[10px] text-white/50 uppercase">
                    <MapPin className="w-3 h-3" /> {entry.location}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-neon-cyan font-bold">{entry.wins}</div>
                <div className="text-[10px] text-white/40 uppercase">Wins</div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {!supabase && (
        <div className="mt-4 text-[10px] text-yellow-500/70 text-center uppercase tracking-widest">
          Running in Mock Mode
        </div>
      )}
    </div>
  );
}
