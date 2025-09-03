import React, { useState, useEffect, useRef } from 'react'
import Board from './components/Board'
import MainMenu from './components/MainMenu'
import OnlineGameManager from './utils/OnlineGameManager'
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
  const [roomCode, setRoomCode] = useState('')
  const [isWaiting, setIsWaiting] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  
  const onlineGameRef = useRef(null)
  const playerColorRef = useRef(null)

  useEffect(() => {
    SoundManager.init()
    if (gameMode) {
      SoundManager.playBackgroundMusic()
    }
    
    return () => {
      if (onlineGameRef.current) {
        onlineGameRef.current.disconnect()
      }
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

  const handleOnlineGameUpdate = (gameData) => {
    if (gameData.host && gameData.guest) {
      setIsWaiting(false)
      setOpponentName(
        playerColorRef.current === 'red' 
          ? gameData.guest.name 
          : gameData.host.name
      )
    } else {
      setIsWaiting(true)
    }
    
    setBoard(gameData.board || Array(6).fill(null).map(() => Array(7).fill(null)))
    setCurrentPlayer(gameData.currentPlayer || 'red')
    setWinner(gameData.winner)
    setIsDraw(gameData.isDraw || false)
    
    if (gameData.winner && gameData.winner !== winner) {
      SoundManager.playWinSound()
    }
  }

  const handleStartGame = async (mode, name, code = null) => {
    setPlayerName(name)
    setGameMode(mode)
    
    if (mode === 'create') {
      onlineGameRef.current = new OnlineGameManager()
      try {
        const roomId = await onlineGameRef.current.createRoom(
          name,
          handleOnlineGameUpdate,
          (error) => console.error('Game error:', error)
        )
        setRoomCode(roomId)
        playerColorRef.current = 'red'
        setIsWaiting(true)
      } catch (error) {
        console.error('Failed to create room:', error)
        alert('Failed to create room. Please check your internet connection.')
        setGameMode(null)
      }
    } else if (mode === 'join') {
      onlineGameRef.current = new OnlineGameManager()
      try {
        await onlineGameRef.current.joinRoom(
          code,
          name,
          handleOnlineGameUpdate,
          (error) => {
            console.error('Game error:', error)
            alert('Room not found! Please check the room code.')
            setGameMode(null)
          }
        )
        setRoomCode(code)
        playerColorRef.current = 'yellow'
      } catch (error) {
        console.error('Failed to join room:', error)
        alert('Failed to join room. Please check the room code.')
        setGameMode(null)
      }
    } else if (mode === 'local') {
      setOpponentName('Player 2')
    }
  }

  const dropDisc = async (col) => {
    if (winner || isDraw) return
    
    if (gameMode === 'create' || gameMode === 'join') {
      if (isWaiting) {
        alert('Waiting for opponent to join!')
        return
      }
      
      if (currentPlayer !== playerColorRef.current) {
        return
      }
      
      for (let row = 5; row >= 0; row--) {
        if (board[row][col] === null) {
          const newBoard = board.map(row => [...row])
          newBoard[row][col] = currentPlayer
          
          SoundManager.playDropSound()
          
          const hasWinner = checkWinner(newBoard, row, col, currentPlayer)
          const hasDraw = !hasWinner && checkDraw(newBoard)
          
          await onlineGameRef.current.updateGameState({
            board: newBoard,
            currentPlayer: currentPlayer === 'red' ? 'yellow' : 'red',
            winner: hasWinner ? currentPlayer : null,
            isDraw: hasDraw,
            lastMove: { row, col, player: currentPlayer }
          })
          
          if (hasWinner) {
            SoundManager.playWinSound()
          }
          break
        }
      }
    } else {
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
  }

  const resetGame = () => {
    if (onlineGameRef.current) {
      onlineGameRef.current.disconnect()
      onlineGameRef.current = null
    }
    
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)))
    setCurrentPlayer('red')
    setWinner(null)
    setIsDraw(false)
    setGameMode(null)
    setRoomCode('')
    setIsWaiting(false)
    setOpponentName('')
    playerColorRef.current = null
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
        {roomCode && (
          <div className="room-code">
            Room Code: <span className="code">{roomCode}</span>
            {isWaiting && <div className="waiting">Waiting for opponent...</div>}
          </div>
        )}
      </div>
      
      <div className="players-info">
        <div className={`player-info ${currentPlayer === 'red' ? 'active' : ''}`}>
          <span className="player-indicator red"></span>
          <span className="player-name">
            {playerColorRef.current === 'red' ? playerName : (gameMode === 'local' ? playerName : opponentName)}
          </span>
        </div>
        <div className={`player-info ${currentPlayer === 'yellow' ? 'active' : ''}`}>
          <span className="player-indicator yellow"></span>
          <span className="player-name">
            {playerColorRef.current === 'yellow' ? playerName : opponentName}
          </span>
        </div>
      </div>
      
      <div className="game-info">
        {winner ? (
          <div className="winner-message">
            <span className={`player-indicator ${winner}`}></span>
            {winner === playerColorRef.current ? 'You win!' : 
             gameMode === 'local' ? `${winner === 'red' ? playerName : opponentName} wins!` : 
             `${opponentName} wins!`}
          </div>
        ) : isDraw ? (
          <div className="draw-message">It's a draw!</div>
        ) : (
          <div className="current-turn">
            {(gameMode === 'create' || gameMode === 'join') 
              ? (currentPlayer === playerColorRef.current ? "Your turn" : `${opponentName}'s turn`)
              : (currentPlayer === 'red' ? `${playerName}'s turn` : `${opponentName}'s turn`)}
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