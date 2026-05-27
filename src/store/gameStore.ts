import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getBestMove } from '@/lib/ai';
import { supabase } from '@/lib/supabase';

export type Player = 1 | 2;
export type BoardState = (Player | null)[][];
export type GameStatus = 'idle' | 'playing' | 'won' | 'draw';
export type GameMode = 'local' | 'ai-easy' | 'ai-medium' | 'ai-hard' | 'online' | 'duel';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  location: string;
  rank: string;
  wins: number;
  losses: number;
  streak: number;
  credits: number;
  unlockedSkins: string[];
}

interface GameState {
  board: BoardState;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningLine: [number, number][] | null;
  turnsCount: number;
  
  gameMode: GameMode;
  isAntigravityEnabled: boolean;
  turnsUntilFlip: number;
  isFlipping: boolean;

  // Multiplayer State
  roomId: string | null;
  multiplayerRole: Player | null; // Are we P1 or P2 in online?
  opponentProfile: Partial<UserProfile> | null;
  isSearchingMatch: boolean;

  // Auth State
  userProfile: UserProfile | null;
  isAuthModalOpen: boolean;
  
  dropToken: (col: number) => void;
  resetGame: () => void;
  setGameMode: (mode: GameMode) => void;
  setAntigravityEnabled: (enabled: boolean) => void;
  triggerGravityFlip: () => void;
  completeGravityFlip: () => void;
  makeAiMove: () => void;
  
  // Multiplayer Methods
  findMatch: () => void;
  receiveRemoteMove: (col: number) => void;
  leaveMatch: () => void;
  handleGameEnd: (winningPlayer: Player | null) => void;
  
  setAuthModalOpen: (isOpen: boolean) => void;
  setUserProfile: (profile: UserProfile | null) => void;
}

const ROWS = 6;
const COLS = 7;
const TURNS_FOR_FLIP = 5;

const createEmptyBoard = (): BoardState => 
  Array.from({ length: ROWS }, () => Array(COLS).fill(null));

// Needs to be exported or moved to a shared place if needed, but keeping it simple here
export const checkWin = (board: BoardState, player: Player): [number, number][] | null => {
  const directions = [
    [[0, 1], [0, -1]], // Horizontal
    [[1, 0], [-1, 0]], // Vertical
    [[1, 1], [-1, -1]], // Diagonal /
    [[1, -1], [-1, 1]]  // Diagonal \
  ];

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (board[row][col] !== player) continue;
      
      for (const dirGroup of directions) {
        let count = 1;
        const line: [number, number][] = [[row, col]];

        for (const [dr, dc] of dirGroup) {
          let r = row + dr;
          let c = col + dc;
          while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
            count++;
            line.push([r, c]);
            r += dr;
            c += dc;
          }
        }

        if (count >= 4) return line;
      }
    }
  }
  return null;
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
  board: createEmptyBoard(),
  currentPlayer: 1,
  status: 'playing',
  winner: null,
  winningLine: null,
  turnsCount: 0,
  
  gameMode: 'local',
  isAntigravityEnabled: false,
  turnsUntilFlip: TURNS_FOR_FLIP,
  isFlipping: false,
  
  roomId: null,
  multiplayerRole: null,
  opponentProfile: null,
  isSearchingMatch: false,
  
  userProfile: null,
  isAuthModalOpen: false,

  setAuthModalOpen: (isOpen) => set({ isAuthModalOpen: isOpen }),
  setUserProfile: (profile) => set({ userProfile: profile }),

  findMatch: () => {
    const mode = get().gameMode;
    
    if (mode === 'duel') {
      set({ 
        roomId: `du-${Math.random().toString(36).substr(2, 9)}`, 
        multiplayerRole: 1, 
        status: 'idle',
        opponentProfile: null
      });
      // Mock a friend joining after 5 seconds
      setTimeout(() => {
        const currentStore = get();
        if (currentStore.gameMode === 'duel' && currentStore.roomId) {
          set({
            status: 'playing',
            opponentProfile: { username: 'Friend_01', rank: 'Unranked', location: 'Direct Link', credits: 0, unlockedSkins: [] }
          });
        }
      }, 5000);
      return;
    }

    set({ isSearchingMatch: true, gameMode: 'online', status: 'idle' });
    
    if (supabase) {
      // Real Supabase logic
    } else {
      setTimeout(() => {
        set({
          isSearchingMatch: false,
          roomId: 'mock-room-777',
          multiplayerRole: 1, // Let's make the user P1
          status: 'playing',
          opponentProfile: { username: 'ShadowBroker', rank: 'Diamond I', location: 'Global', credits: 0, unlockedSkins: [] }
        });
      }, 2500);
    }
  },

  handleGameEnd: (winningPlayer: Player | null) => {
    const { gameMode, multiplayerRole, userProfile } = get();
    if (!userProfile) return;

    let isWin = false;
    let isLoss = false;

    if (winningPlayer === null) {
      // Draw
    } else if (gameMode === 'local' || gameMode.startsWith('ai-')) {
      if (winningPlayer === 1) isWin = true;
      else isLoss = true;
    } else if (gameMode === 'online' || gameMode === 'duel') {
      if (winningPlayer === multiplayerRole) isWin = true;
      else isLoss = true;
    }

    const newProfile = { ...userProfile };
    if (isWin) {
      newProfile.wins += 1;
      newProfile.streak += 1;
      newProfile.credits += 150;
      // rank up mock logic
      if (newProfile.wins > 50) newProfile.rank = 'Diamond I';
      else if (newProfile.wins > 20) newProfile.rank = 'Platinum III';
      else if (newProfile.wins > 5) newProfile.rank = 'Gold I';
    } else if (isLoss) {
      newProfile.losses += 1;
      newProfile.streak = 0;
      newProfile.credits += 25; // consolation prize
    } else {
      newProfile.credits += 50; // draw
    }

    set({ userProfile: newProfile });
  },

  leaveMatch: () => {
    set({
      roomId: null,
      multiplayerRole: null,
      opponentProfile: null,
      isSearchingMatch: false,
      gameMode: 'local',
      status: 'idle',
      board: createEmptyBoard(),
      turnsCount: 0,
      currentPlayer: 1
    });
  },

  receiveRemoteMove: (col: number) => {
    const { board, currentPlayer, status, turnsCount, isFlipping, turnsUntilFlip, isAntigravityEnabled } = get();
    
    if (status !== 'playing' || isFlipping) return;

    let emptyRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) {
        emptyRow = r;
        break;
      }
    }

    if (emptyRow === -1) return;

    const newBoard = board.map(row => [...row]);
    newBoard[emptyRow][col] = currentPlayer;
    
    const winningLine = checkWin(newBoard, currentPlayer);
    
    if (winningLine) {
      set({ board: newBoard, status: 'won', winner: currentPlayer, winningLine, turnsCount: turnsCount + 1 });
      get().handleGameEnd(currentPlayer);
      return;
    }

    const isDraw = newBoard[0].every(cell => cell !== null);
    if (isDraw) {
      set({ board: newBoard, status: 'draw', turnsCount: turnsCount + 1 });
      get().handleGameEnd(null);
      return;
    }

    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    let nextTurnsUntilFlip = turnsUntilFlip - 1;
    
    set({
      board: newBoard,
      currentPlayer: nextPlayer,
      turnsCount: turnsCount + 1,
      turnsUntilFlip: isAntigravityEnabled ? nextTurnsUntilFlip : TURNS_FOR_FLIP
    });

    if (isAntigravityEnabled && nextTurnsUntilFlip === 0) {
      get().triggerGravityFlip();
    }
  },

  setGameMode: (mode) => set({ gameMode: mode }),
  setAntigravityEnabled: (enabled) => set({ isAntigravityEnabled: enabled, turnsUntilFlip: TURNS_FOR_FLIP }),

  dropToken: (col: number) => {
    const { board, currentPlayer, status, turnsCount, isFlipping, gameMode, turnsUntilFlip, isAntigravityEnabled } = get();
    
    if (status !== 'playing' || isFlipping) return;
    
    // In AI mode, prevent Player 1 from dropping if it's AI's turn
    if (gameMode.startsWith('ai-') && currentPlayer === 2) return;
    
    // In Online/Duel mode, prevent drop if it's not our turn
    if ((gameMode === 'online' || gameMode === 'duel') && currentPlayer !== get().multiplayerRole) return;

    // Find lowest empty row in col
    let emptyRow = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === null) {
        emptyRow = r;
        break;
      }
    }

    if (emptyRow === -1) return; // Column is full

    const newBoard = board.map(row => [...row]);
    newBoard[emptyRow][col] = currentPlayer;
    
    const winningLine = checkWin(newBoard, currentPlayer);
    
    if (winningLine) {
      set({
        board: newBoard,
        status: 'won',
        winner: currentPlayer,
        winningLine,
        turnsCount: turnsCount + 1
      });
      get().handleGameEnd(currentPlayer);
      return;
    }

    const isDraw = newBoard[0].every(cell => cell !== null);
    if (isDraw) {
      set({ board: newBoard, status: 'draw', turnsCount: turnsCount + 1 });
      get().handleGameEnd(null);
      return;
    }

    const nextPlayer = currentPlayer === 1 ? 2 : 1;
    let nextTurnsUntilFlip = turnsUntilFlip - 1;
    
    set({
      board: newBoard,
      currentPlayer: nextPlayer,
      turnsCount: turnsCount + 1,
      turnsUntilFlip: isAntigravityEnabled ? nextTurnsUntilFlip : TURNS_FOR_FLIP
    });

    // Handle Antigravity Trigger
    if (isAntigravityEnabled && nextTurnsUntilFlip === 0) {
      get().triggerGravityFlip();
      // Notice: If online, we would broadcast the drop to the network here.
      // supabase.channel(`room_${get().roomId}`).send({ type: 'broadcast', event: 'drop', payload: { col } })
      return; 
    }

    // Broadcast if online or duel
    if (gameMode === 'online' || gameMode === 'duel') {
      // Mock remote opponent move
      if (nextPlayer !== get().multiplayerRole) {
        setTimeout(() => get().receiveRemoteMove(Math.floor(Math.random() * COLS)), 1500);
      }
    }

    // Trigger AI move if it's now AI's turn
    if (gameMode.startsWith('ai-') && nextPlayer === 2) {
      setTimeout(() => get().makeAiMove(), 500); // Small delay for UX
    }
  },

  makeAiMove: () => {
    const { board, currentPlayer, status, gameMode, isFlipping } = get();
    if (status !== 'playing' || isFlipping || currentPlayer !== 2) return;
    
    const difficulty = gameMode.split('-')[1] as 'easy' | 'medium' | 'hard';
    const bestCol = getBestMove(board, difficulty, 2);
    
    if (bestCol !== -1) {
      // Temporarily mock the drop by calling a private internal drop logic, or refactor dropToken.
      // Since dropToken prevents P2 drops if gameMode is AI, we need to bypass that.
      
      // We can just execute the logic:
      const { turnsCount, turnsUntilFlip, isAntigravityEnabled } = get();
      
      let emptyRow = -1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (board[r][bestCol] === null) {
          emptyRow = r;
          break;
        }
      }

      if (emptyRow === -1) return;

      const newBoard = board.map(row => [...row]);
      newBoard[emptyRow][bestCol] = 2;
      
      const winningLine = checkWin(newBoard, 2);
      
      if (winningLine) {
        set({ board: newBoard, status: 'won', winner: 2, winningLine, turnsCount: turnsCount + 1 });
        get().handleGameEnd(2);
        return;
      }

      const isDraw = newBoard[0].every(cell => cell !== null);
      if (isDraw) {
        set({ board: newBoard, status: 'draw', turnsCount: turnsCount + 1 });
        get().handleGameEnd(null);
        return;
      }

      const nextPlayer = 1;
      let nextTurnsUntilFlip = turnsUntilFlip - 1;
      
      set({
        board: newBoard,
        currentPlayer: nextPlayer,
        turnsCount: turnsCount + 1,
        turnsUntilFlip: isAntigravityEnabled ? nextTurnsUntilFlip : TURNS_FOR_FLIP
      });

      if (isAntigravityEnabled && nextTurnsUntilFlip === 0) {
        get().triggerGravityFlip();
      }
    }
  },

  triggerGravityFlip: () => {
    set({ isFlipping: true, turnsUntilFlip: TURNS_FOR_FLIP });
  },

  completeGravityFlip: () => {
    const { board, currentPlayer, gameMode } = get();
    
      // 1. Rotate 180
      const rotated = createEmptyBoard();
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          rotated[ROWS - 1 - r][COLS - 1 - c] = board[r][c];
        }
      }

    // 2. Apply Gravity
    const newBoard = createEmptyBoard();
    for (let c = 0; c < COLS; c++) {
      let emptyRow = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (rotated[r][c] !== null) {
          newBoard[emptyRow][c] = rotated[r][c];
          emptyRow--;
        }
      }
    }

    // Check wins for both players after gravity
    const p1Win = checkWin(newBoard, 1);
    const p2Win = checkWin(newBoard, 2);

    if (p1Win || p2Win) {
      const winner = p1Win ? 1 : 2;
      set({
        board: newBoard,
        isFlipping: false,
        status: 'won',
        winner,
        winningLine: p1Win || p2Win
      });
      get().handleGameEnd(winner);
      return;
    }

    set({ board: newBoard, isFlipping: false });

    // If it's AI's turn after flip, trigger it
    if (gameMode.startsWith('ai-') && currentPlayer === 2) {
      setTimeout(() => get().makeAiMove(), 500);
    }
  },

  resetGame: () => {
    set({
      board: createEmptyBoard(),
      currentPlayer: 1,
      status: 'playing',
      winner: null,
      winningLine: null,
      turnsCount: 0,
      turnsUntilFlip: TURNS_FOR_FLIP,
      isFlipping: false
    });
  }
}),
    {
      name: 'antigravity-storage',
      partialize: (state) => ({ userProfile: state.userProfile }) // only persist userProfile
    }
  )
);
