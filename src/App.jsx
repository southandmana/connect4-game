import React, { useState } from 'react'
import Board from './components/Board'
import './App.css'

function App() {
  const [board, setBoard] = useState(Array(6).fill(null).map(() => Array(7).fill(null)))
  const [currentPlayer, setCurrentPlayer] = useState('red')
  const [winner, setWinner] = useState(null)
  const [isDraw, setIsDraw] = useState(false)

  const checkWinner = (board, row, col, player) => {
    const checkDirection = (deltaRow, deltaCol) => {
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

    return checkDirection(0, 1) || checkDirection(1, 0) || checkDirection(1, 1) || checkDirection(1, -1)
  }

  const checkDraw = (board) => {
    return board[0].every(cell => cell !== null)
  }

  const dropDisc = (col) => {
    if (winner || isDraw) return
    
    const newBoard = board.map(row => [...row])
    
    for (let row = 5; row >= 0; row--) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = currentPlayer
        setBoard(newBoard)
        
        if (checkWinner(newBoard, row, col, currentPlayer)) {
          setWinner(currentPlayer)
        } else if (checkDraw(newBoard)) {
          setIsDraw(true)
        } else {
          setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red')
        }
        break
      }
    }
  }

  const resetGame = () => {
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)))
    setCurrentPlayer('red')
    setWinner(null)
    setIsDraw(false)
  }

  return (
    <div className="app">
      <h1>Connect 4</h1>
      <div className="game-info">
        {winner ? (
          <div className="winner-message">
            <span className={`player-indicator ${winner}`}></span>
            {winner.charAt(0).toUpperCase() + winner.slice(1)} wins!
          </div>
        ) : isDraw ? (
          <div className="draw-message">It's a draw!</div>
        ) : (
          <div className="current-player">
            Current Player: <span className={`player-indicator ${currentPlayer}`}></span>
          </div>
        )}
      </div>
      <Board board={board} onColumnClick={dropDisc} />
      <button className="reset-button" onClick={resetGame}>New Game</button>
    </div>
  )
}

export default App