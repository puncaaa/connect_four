import { BoardState, Player } from '@/store/gameStore';

const ROWS = 6;
const COLS = 7;

export function getBestMove(board: BoardState, difficulty: 'easy' | 'medium' | 'hard', aiPlayer: Player): number {
  const validMoves = getValidMoves(board);
  if (validMoves.length === 0) return -1;

  if (difficulty === 'easy') {
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  if (difficulty === 'medium') {
    // 1. Can AI win?
    for (const col of validMoves) {
      if (checkWinningMove(board, col, aiPlayer)) return col;
    }
    // 2. Must AI block?
    const opponent: Player = aiPlayer === 1 ? 2 : 1;
    for (const col of validMoves) {
      if (checkWinningMove(board, col, opponent)) return col;
    }
    // 3. Play center if available, else random
    if (validMoves.includes(3)) return 3;
    return validMoves[Math.floor(Math.random() * validMoves.length)];
  }

  // Hard: Minimax with alpha-beta pruning (depth 5)
  // To keep it performant in JS, depth 5 is usually fast enough for 7x6
  let bestScore = -Infinity;
  let bestMove = validMoves[0];

  // Helper to shuffle moves to add slight variance
  const shuffledMoves = validMoves.sort(() => Math.random() - 0.5);

  for (const col of shuffledMoves) {
    const newBoard = simulateMove(board, col, aiPlayer);
    const score = minimax(newBoard, 5, -Infinity, Infinity, false, aiPlayer);
    if (score > bestScore) {
      bestScore = score;
      bestMove = col;
    }
  }

  return bestMove;
}

function getValidMoves(board: BoardState): number[] {
  const moves = [];
  for (let c = 0; c < COLS; c++) {
    if (board[0][c] === null) moves.push(c);
  }
  return moves;
}

function getNextOpenRow(board: BoardState, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) return r;
  }
  return -1;
}

function simulateMove(board: BoardState, col: number, player: Player): BoardState {
  const newBoard = board.map(row => [...row]);
  const row = getNextOpenRow(newBoard, col);
  if (row !== -1) newBoard[row][col] = player;
  return newBoard;
}

function checkWinningMove(board: BoardState, col: number, player: Player): boolean {
  const tempBoard = simulateMove(board, col, player);
  const r = getNextOpenRow(board, col);
  if (r === -1) return false;
  return checkWinCondition(tempBoard, r, col, player);
}

// Basic win check returning boolean
function checkWinCondition(board: BoardState, row: number, col: number, player: Player): boolean {
  const directions = [
    [[0, 1], [0, -1]],
    [[1, 0], [-1, 0]],
    [[1, 1], [-1, -1]],
    [[1, -1], [-1, 1]]
  ];

  for (const dirGroup of directions) {
    let count = 1;
    for (const [dr, dc] of dirGroup) {
      let r = row + dr;
      let c = col + dc;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
        count++;
        r += dr;
        c += dc;
      }
    }
    if (count >= 4) return true;
  }
  return false;
}

// Evaluation function for Minimax
function evaluateBoard(board: BoardState, aiPlayer: Player): number {
  let score = 0;
  const opponent: Player = aiPlayer === 1 ? 2 : 1;

  // Center column preference
  let centerCount = 0;
  for (let r = 0; r < ROWS; r++) {
    if (board[r][3] === aiPlayer) centerCount++;
  }
  score += centerCount * 3;

  // Check all windows of 4
  // Horizontal
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r][c+1], board[r][c+2], board[r][c+3]];
      score += evaluateWindow(window, aiPlayer, opponent);
    }
  }
  // Vertical
  for (let c = 0; c < COLS; c++) {
    for (let r = 0; r < ROWS - 3; r++) {
      const window = [board[r][c], board[r+1][c], board[r+2][c], board[r+3][c]];
      score += evaluateWindow(window, aiPlayer, opponent);
    }
  }
  // Diagonal /
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r+3][c], board[r+2][c+1], board[r+1][c+2], board[r][c+3]];
      score += evaluateWindow(window, aiPlayer, opponent);
    }
  }
  // Diagonal \
  for (let r = 0; r < ROWS - 3; r++) {
    for (let c = 0; c < COLS - 3; c++) {
      const window = [board[r][c], board[r+1][c+1], board[r+2][c+2], board[r+3][c+3]];
      score += evaluateWindow(window, aiPlayer, opponent);
    }
  }

  return score;
}

function evaluateWindow(window: (Player | null)[], aiPlayer: Player, opponent: Player): number {
  let score = 0;
  let aiCount = 0;
  let oppCount = 0;
  let emptyCount = 0;

  for (const cell of window) {
    if (cell === aiPlayer) aiCount++;
    else if (cell === opponent) oppCount++;
    else emptyCount++;
  }

  if (aiCount === 4) score += 100;
  else if (aiCount === 3 && emptyCount === 1) score += 5;
  else if (aiCount === 2 && emptyCount === 2) score += 2;

  if (oppCount === 3 && emptyCount === 1) score -= 4;

  return score;
}

function isTerminalNode(board: BoardState): boolean {
  return getValidMoves(board).length === 0; // Check draw. (Win is checked during loop)
}

function minimax(board: BoardState, depth: number, alpha: number, beta: number, maximizingPlayer: boolean, aiPlayer: Player): number {
  const validMoves = getValidMoves(board);
  const opponent: Player = aiPlayer === 1 ? 2 : 1;

  // Check for terminal state (win/draw) at this node
  // If the previous move won the game, return massive score
  // Actually, we should check if any valid move could have won. But it's easier to check if the board is already won.
  // Instead of full check, we rely on the depth and evaluation.

  if (depth === 0 || isTerminalNode(board)) {
    return evaluateBoard(board, aiPlayer);
  }

  if (maximizingPlayer) {
    let value = -Infinity;
    for (const col of validMoves) {
      if (checkWinningMove(board, col, aiPlayer)) return 100000 + depth; // Favor faster wins
      const newBoard = simulateMove(board, col, aiPlayer);
      value = Math.max(value, minimax(newBoard, depth - 1, alpha, beta, false, aiPlayer));
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  } else {
    let value = Infinity;
    for (const col of validMoves) {
      if (checkWinningMove(board, col, opponent)) return -100000 - depth;
      const newBoard = simulateMove(board, col, opponent);
      value = Math.min(value, minimax(newBoard, depth - 1, alpha, beta, true, aiPlayer));
      beta = Math.min(beta, value);
      if (alpha >= beta) break;
    }
    return value;
  }
}
