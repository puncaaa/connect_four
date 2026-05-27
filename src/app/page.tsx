import GameBoard from "@/components/GameBoard";
import Dashboard from "@/components/Dashboard";
import Leaderboard from "@/components/Leaderboard";
import AiCoach from "@/components/AiCoach";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col xl:flex-row items-center xl:items-start justify-center gap-8 lg:gap-8 p-4 sm:p-8 lg:p-12 w-full max-w-[1600px] mx-auto h-full overflow-y-auto">
      <div className="w-full xl:w-auto flex justify-center max-xl:order-3 pt-8 xl:pt-32">
         <Leaderboard />
      </div>
      
      <div className="w-full xl:flex-1 flex flex-col items-center justify-center h-full max-xl:order-2">
         <GameBoard />
         <AiCoach />
      </div>
      
      <div className="w-full xl:w-auto flex flex-col items-center justify-center h-full max-xl:order-1 pt-8 xl:pt-0">
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter mb-8 text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple drop-shadow-[0_0_15px_rgba(0,243,255,0.5)]">
          ANTIGRAVITY
          <br />
          CONNECT
        </h1>
        <Dashboard />
      </div>
    </div>
  );
}
