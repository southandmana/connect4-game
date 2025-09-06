// Game configuration constants
const GAME_CONFIG = {
  BOARD_ROWS: 6,
  BOARD_COLS: 7,
  WINNING_LENGTH: 4,
  MIN_DIFFICULTY: 1,
  MAX_DIFFICULTY: 10,
  SCORES: {
    WIN: 1000,
    LOSE: -1000,
    FOUR_IN_ROW: 100,
    THREE_WITH_EMPTY: 10,
    THREE_BLOCK: -80,
    TWO_WITH_EMPTY: 2
  },
  RANDOMNESS: {
    BASE: 0.5,
    REDUCTION: 0.05,
    MIN: 0.05
  }
}

class AIOpponent {
  constructor(difficulty = 1, opponentNumber = 1) {
    this.difficulty = Math.max(GAME_CONFIG.MIN_DIFFICULTY, Math.min(GAME_CONFIG.MAX_DIFFICULTY, difficulty))
    this.opponentNumber = opponentNumber
    this.color = 'yellow'
    this.maxDepth = this.getMaxDepth()
    this.randomness = this.getRandomness()
    this.name = this.getOpponentName()
  }

  getOpponentName() {
    const opponents = [
      'Code Novice',
      'Cyber Warrior',
      'Net Scout',
      'Data Fighter',
      'System Guard',
      'Neon Knight',
      'AI Strategist',
      'Digital Master',
      'Ghost Hacker',
      'The Mainframe'
    ]
    return opponents[this.opponentNumber - 1] || `Opponent ${this.opponentNumber}`
  }

  getMaxDepth() {
    return Math.min(2 + Math.floor(this.difficulty / 2), 8)
  }

  getRandomness() {
    return Math.max(
      GAME_CONFIG.RANDOMNESS.MIN, 
      GAME_CONFIG.RANDOMNESS.BASE - (this.difficulty * GAME_CONFIG.RANDOMNESS.REDUCTION)
    )
  }

  // Main AI move selection
  getMove(board) {
    try {
      const validMoves = this.getValidMoves(board)
      
      if (validMoves.length === 0) return -1

      if (Math.random() < this.randomness) {
        return validMoves[Math.floor(Math.random() * validMoves.length)]
      }

      const bestMove = this.minimax(board, this.maxDepth, true, -Infinity, Infinity)
      return bestMove.col !== undefined ? bestMove.col : validMoves[0]
    } catch (error) {
      const validMoves = this.getValidMoves(board)
      return validMoves.length > 0 ? validMoves[0] : -1
    }
  }

  // Minimax algorithm with alpha-beta pruning
  minimax(board, depth, isMaximizing, alpha, beta) {
    const winner = this.checkWinner(board)
    
    // Terminal states
    if (winner === 'yellow') return { score: GAME_CONFIG.SCORES.WIN + depth }
    if (winner === 'red') return { score: GAME_CONFIG.SCORES.LOSE - depth }
    if (this.isBoardFull(board) || depth === 0) {
      return { score: this.evaluateBoard(board) }
    }

    const validMoves = this.getValidMoves(board)
    let bestMove = { col: validMoves[0], score: isMaximizing ? -Infinity : Infinity }

    for (const col of validMoves) {
      const newBoard = this.makeMove(board, col, isMaximizing ? 'yellow' : 'red')
      const result = this.minimax(newBoard, depth - 1, !isMaximizing, alpha, beta)

      if (isMaximizing) {
        if (result.score > bestMove.score) {
          bestMove = { col, score: result.score }
        }
        alpha = Math.max(alpha, result.score)
      } else {
        if (result.score < bestMove.score) {
          bestMove = { col, score: result.score }
        }
        beta = Math.min(beta, result.score)
      }

      // Alpha-beta pruning
      if (beta <= alpha) break
    }

    return bestMove
  }

  // Board evaluation function
  evaluateBoard(board) {
    let score = 0
    const horizontalLimit = GAME_CONFIG.BOARD_COLS - GAME_CONFIG.WINNING_LENGTH + 1
    const verticalLimit = GAME_CONFIG.BOARD_ROWS - GAME_CONFIG.WINNING_LENGTH + 1

    // Horizontal windows
    for (let row = 0; row < GAME_CONFIG.BOARD_ROWS; row++) {
      for (let col = 0; col < horizontalLimit; col++) {
        const window = [
          board[row][col], 
          board[row][col + 1], 
          board[row][col + 2], 
          board[row][col + 3]
        ]
        score += this.evaluateWindow(window)
      }
    }

    // Vertical windows
    for (let col = 0; col < GAME_CONFIG.BOARD_COLS; col++) {
      for (let row = 0; row < verticalLimit; row++) {
        const window = [
          board[row][col], 
          board[row + 1][col], 
          board[row + 2][col], 
          board[row + 3][col]
        ]
        score += this.evaluateWindow(window)
      }
    }

    // Positive diagonal windows
    for (let row = 0; row < verticalLimit; row++) {
      for (let col = 0; col < horizontalLimit; col++) {
        const window = [
          board[row][col], 
          board[row + 1][col + 1], 
          board[row + 2][col + 2], 
          board[row + 3][col + 3]
        ]
        score += this.evaluateWindow(window)
      }
    }

    // Negative diagonal windows
    for (let row = 0; row < verticalLimit; row++) {
      for (let col = GAME_CONFIG.WINNING_LENGTH - 1; col < GAME_CONFIG.BOARD_COLS; col++) {
        const window = [
          board[row][col], 
          board[row + 1][col - 1], 
          board[row + 2][col - 2], 
          board[row + 3][col - 3]
        ]
        score += this.evaluateWindow(window)
      }
    }

    return score
  }

  evaluateWindow(window) {
    let score = 0
    const aiCount = window.filter(cell => cell === 'yellow').length
    const playerCount = window.filter(cell => cell === 'red').length
    const emptyCount = window.filter(cell => cell === null).length

    if (aiCount > 0 && playerCount > 0) return 0

    if (aiCount === GAME_CONFIG.WINNING_LENGTH) {
      score += GAME_CONFIG.SCORES.FOUR_IN_ROW
    } else if (aiCount === 3 && emptyCount === 1) {
      score += GAME_CONFIG.SCORES.THREE_WITH_EMPTY
    } else if (aiCount === 2 && emptyCount === 2) {
      score += GAME_CONFIG.SCORES.TWO_WITH_EMPTY
    }

    if (playerCount === GAME_CONFIG.WINNING_LENGTH) {
      score -= GAME_CONFIG.SCORES.FOUR_IN_ROW
    } else if (playerCount === 3 && emptyCount === 1) {
      score += GAME_CONFIG.SCORES.THREE_BLOCK
    } else if (playerCount === 2 && emptyCount === 2) {
      score -= GAME_CONFIG.SCORES.TWO_WITH_EMPTY
    }

    return score
  }

  // Utility functions
  getValidMoves(board) {
    const validMoves = []
    for (let col = 0; col < GAME_CONFIG.BOARD_COLS; col++) {
      if (board[0][col] === null) {
        validMoves.push(col)
      }
    }
    return validMoves
  }

  makeMove(board, col, player) {
    const newBoard = board.map(row => [...row])
    for (let row = GAME_CONFIG.BOARD_ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = player
        break
      }
    }
    return newBoard
  }

  checkWinner(board) {
    const checkDirection = (row, col, deltaRow, deltaCol, player) => {
      let count = 1
      
      for (let i = 1; i < GAME_CONFIG.WINNING_LENGTH; i++) {
        const newRow = row + deltaRow * i
        const newCol = col + deltaCol * i
        if (newRow >= 0 && newRow < GAME_CONFIG.BOARD_ROWS && 
            newCol >= 0 && newCol < GAME_CONFIG.BOARD_COLS && 
            board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }
      
      for (let i = 1; i < GAME_CONFIG.WINNING_LENGTH; i++) {
        const newRow = row - deltaRow * i
        const newCol = col - deltaCol * i
        if (newRow >= 0 && newRow < GAME_CONFIG.BOARD_ROWS && 
            newCol >= 0 && newCol < GAME_CONFIG.BOARD_COLS && 
            board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }
      
      return count >= GAME_CONFIG.WINNING_LENGTH
    }

    for (let row = 0; row < GAME_CONFIG.BOARD_ROWS; row++) {
      for (let col = 0; col < GAME_CONFIG.BOARD_COLS; col++) {
        const player = board[row][col]
        if (player && (
          checkDirection(row, col, 0, 1, player) ||
          checkDirection(row, col, 1, 0, player) ||
          checkDirection(row, col, 1, 1, player) ||
          checkDirection(row, col, 1, -1, player)
        )) {
          return player
        }
      }
    }
    return null
  }

  isBoardFull(board) {
    return board[0].every(cell => cell !== null)
  }
}

export default AIOpponent