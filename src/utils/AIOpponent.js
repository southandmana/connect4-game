class AIOpponent {
  constructor(difficulty = 1, opponentNumber = 1) {
    this.difficulty = Math.max(1, Math.min(10, difficulty))
    this.opponentNumber = opponentNumber
    this.color = 'yellow' // AI is always yellow, player is red
    this.maxDepth = this.getMaxDepth()
    this.randomness = this.getRandomness()
    this.name = this.getOpponentName()
  }

  getOpponentName() {
    const opponents = [
      'Flame Novice',      // 1
      'Ember Warrior',     // 2
      'Fire Scout',        // 3
      'Blaze Fighter',     // 4
      'Inferno Guard',     // 5
      'Hellfire Knight',   // 6
      'Demon Strategist',  // 7
      'Infernal Master',   // 8
      'Soul Reaper',       // 9
      'The Dark Lord'      // 10 - Final Boss
    ]
    return opponents[this.opponentNumber - 1] || `Opponent ${this.opponentNumber}`
  }

  getMaxDepth() {
    // Difficulty 1-3: Look ahead 1-2 moves (easy)
    // Difficulty 4-6: Look ahead 3-4 moves (medium)
    // Difficulty 7-8: Look ahead 5-6 moves (hard)
    // Difficulty 9-10: Look ahead 7-8 moves (expert)
    return Math.min(2 + Math.floor(this.difficulty / 2), 8)
  }

  getRandomness() {
    // Higher difficulty = less randomness (more consistent play)
    // Difficulty 1-2: 40% random moves
    // Difficulty 3-4: 30% random moves
    // Difficulty 5-6: 20% random moves
    // Difficulty 7-8: 10% random moves
    // Difficulty 9-10: 5% random moves
    return Math.max(0.05, 0.5 - (this.difficulty * 0.05))
  }

  // Main AI move selection
  getMove(board) {
    const validMoves = this.getValidMoves(board)
    
    if (validMoves.length === 0) return -1

    // Early game: Add some randomness for lower difficulties
    if (Math.random() < this.randomness) {
      return validMoves[Math.floor(Math.random() * validMoves.length)]
    }

    // Use minimax algorithm for strategic play
    const bestMove = this.minimax(board, this.maxDepth, true, -Infinity, Infinity)
    return bestMove.col !== undefined ? bestMove.col : validMoves[0]
  }

  // Minimax algorithm with alpha-beta pruning
  minimax(board, depth, isMaximizing, alpha, beta) {
    const winner = this.checkWinner(board)
    
    // Terminal states
    if (winner === 'yellow') return { score: 1000 + depth } // AI wins
    if (winner === 'red') return { score: -1000 - depth }   // Player wins
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

    // Evaluate all possible 4-piece windows
    // Horizontal
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 4; col++) {
        const window = [board[row][col], board[row][col + 1], board[row][col + 2], board[row][col + 3]]
        score += this.evaluateWindow(window)
      }
    }

    // Vertical
    for (let col = 0; col < 7; col++) {
      for (let row = 0; row < 3; row++) {
        const window = [board[row][col], board[row + 1][col], board[row + 2][col], board[row + 3][col]]
        score += this.evaluateWindow(window)
      }
    }

    // Positive diagonal
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 4; col++) {
        const window = [board[row][col], board[row + 1][col + 1], board[row + 2][col + 2], board[row + 3][col + 3]]
        score += this.evaluateWindow(window)
      }
    }

    // Negative diagonal
    for (let row = 0; row < 3; row++) {
      for (let col = 3; col < 7; col++) {
        const window = [board[row][col], board[row + 1][col - 1], board[row + 2][col - 2], board[row + 3][col - 3]]
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

    // Only evaluate if window belongs to one player
    if (aiCount > 0 && playerCount > 0) return 0

    if (aiCount === 4) score += 100
    else if (aiCount === 3 && emptyCount === 1) score += 10
    else if (aiCount === 2 && emptyCount === 2) score += 2

    if (playerCount === 4) score -= 100
    else if (playerCount === 3 && emptyCount === 1) score -= 80
    else if (playerCount === 2 && emptyCount === 2) score -= 2

    return score
  }

  // Utility functions
  getValidMoves(board) {
    const validMoves = []
    for (let col = 0; col < 7; col++) {
      if (board[0][col] === null) {
        validMoves.push(col)
      }
    }
    return validMoves
  }

  makeMove(board, col, player) {
    const newBoard = board.map(row => [...row])
    for (let row = 5; row >= 0; row--) {
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
      
      for (let i = 1; i < 4; i++) {
        const newRow = row + deltaRow * i
        const newCol = col + deltaCol * i
        if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }
      
      for (let i = 1; i < 4; i++) {
        const newRow = row - deltaRow * i
        const newCol = col - deltaCol * i
        if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && board[newRow][newCol] === player) {
          count++
        } else {
          break
        }
      }
      
      return count >= 4
    }

    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
        const player = board[row][col]
        if (player && (
          checkDirection(row, col, 0, 1, player) ||  // horizontal
          checkDirection(row, col, 1, 0, player) ||  // vertical
          checkDirection(row, col, 1, 1, player) ||  // diagonal
          checkDirection(row, col, 1, -1, player)    // anti-diagonal
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