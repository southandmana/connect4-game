import React, { useState, useEffect } from 'react'
import Board from './components/Board'
import MainMenu from './components/MainMenu'
import SoundManager from './utils/SoundManager'
import './App.css'

function App() {
  const [gameMode, setGameMode] = useState(null)
  const [board, setBoard] = useState(Array(6).fill(null).map(() => Array(7).fill(null)))
  const [currentPlayer, setCurrentPlayer] = useState('red')
  const [winner, setWinner] = useState(null)
  const [isDraw, setIsDraw] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [opponentName, setOpponentName] = useState('')
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    SoundManager.init()
    if (gameMode) {
      SoundManager.playBackgroundMusic()
    }
    
    return () => {
      SoundManager.stopBackgroundMusic()
    }
  }, [gameMode])

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

  const handleStartGame = (mode, name) => {
    setPlayerName(name || 'Player 1')
    setGameMode(mode)
    setOpponentName(mode === 'local' ? 'Player 2' : 'Computer')
    
    if (mode === 'create' || mode === 'join') {
      alert('Online multiplayer coming soon! For now, enjoy local play.')
      setGameMode('local')
      setOpponentName('Player 2')
    }
  }

  const dropDisc = (col) => {
    if (winner || isDraw) return
    
    const newBoard = board.map(row => [...row])
    
    for (let row = 5; row >= 0; row--) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = currentPlayer
        setBoard(newBoard)
        
        SoundManager.playDropSound()
        
        if (checkWinner(newBoard, row, col, currentPlayer)) {
          setWinner(currentPlayer)
          SoundManager.playWinSound()
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
    setGameMode(null)
    setOpponentName('')
  }

  const toggleMute = () => {
    const muted = SoundManager.toggleMute()
    setIsMuted(muted)
  }

  if (!gameMode) {
    return <MainMenu onStartGame={handleStartGame} />
  }

  return (
    <div className="app">
      <div className="game-header">
        <h1>Connect 4</h1>
      </div>
      
      <div className="players-info">
        <div className={`player-info ${currentPlayer === 'red' ? 'active' : ''}`}>
          <span className="player-indicator red"></span>
          <span className="player-name">{playerName}</span>
        </div>
        <div className={`player-info ${currentPlayer === 'yellow' ? 'active' : ''}`}>
          <span className="player-indicator yellow"></span>
          <span className="player-name">{opponentName}</span>
        </div>
      </div>
      
      <div className="game-info">
        {winner ? (
          <div className="winner-message">
            <span className={`player-indicator ${winner}`}></span>
            {winner === 'red' ? `${playerName} wins!` : `${opponentName} wins!`}
          </div>
        ) : isDraw ? (
          <div className="draw-message">It's a draw!</div>
        ) : (
          <div className="current-turn">
            {currentPlayer === 'red' ? `${playerName}'s turn` : `${opponentName}'s turn`}
          </div>
        )}
      </div>
      
      <Board board={board} onColumnClick={dropDisc} />
      
      <div className="game-controls">
        <button className="reset-button" onClick={resetGame}>
          Back to Menu
        </button>
        <button className="mute-button" onClick={toggleMute}>
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
      </div>
    </div>
  )
}

export default App