import React, { useState, useEffect, useRef, useCallback } from 'react'
import Board from './Board'
import OnlineGameManager from '../utils/OnlineGameManager'
import SoundManager from '../utils/SoundManager'
import './OnlineMode/OnlineMode.css'

function OnlineMode({ mode, playerName, roomCodeInput, onBackToMenu }) {
  // Game state
  const [board, setBoard] = useState(
    Array(6).fill(null).map(() => Array(7).fill(null))
  )
  const [currentPlayer, setCurrentPlayer] = useState('red')
  const [winner, setWinner] = useState(null)
  const [isDraw, setIsDraw] = useState(false)
  const [winningPieces, setWinningPieces] = useState([])
  
  // Online state
  const [roomCode, setRoomCode] = useState('')
  const [opponentName, setOpponentName] = useState('')
  const [isWaiting, setIsWaiting] = useState(true)
  const [connectionError, setConnectionError] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  
  // References
  const onlineGameRef = useRef(null)
  const playerColorRef = useRef(null)
  const reconnectTimeoutRef = useRef(null)
  
  // Firebase connection health check
  const connectionHealthCheck = useCallback(() => {
    if (!onlineGameRef.current) return
    
    const checkInterval = setInterval(() => {
      if (onlineGameRef.current && !onlineGameRef.current.isConnected) {
        setConnectionError('Connection lost. Attempting to reconnect...')
        attemptReconnect()
      }
    }, 5000) // Check every 5 seconds
    
    return () => clearInterval(checkInterval)
  }, [])
  
  // Reconnect attempt
  const attemptReconnect = useCallback(async () => {
    if (!roomCode || !onlineGameRef.current) return
    
    try {
      await onlineGameRef.current.reconnect()
      setConnectionError(null)
      setIsConnected(true)
    } catch (error) {
      console.error('Reconnection failed:', error)
      setConnectionError('Failed to reconnect. Please check your internet connection.')
      
      // Retry after 3 seconds
      reconnectTimeoutRef.current = setTimeout(attemptReconnect, 3000)
    }
  }, [roomCode])
  
  // Handle online game updates from Firebase
  const handleOnlineGameUpdate = useCallback((gameData) => {
    if (!gameData) return
    
    // Update connection status
    setIsConnected(true)
    setConnectionError(null)
    
    // Check if both players are connected
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
    
    // Convert board string from Firebase back to array
    let boardData = Array(6).fill(null).map(() => Array(7).fill(null))
    if (gameData.boardString) {
      console.log('Converting board string from Firebase:', gameData.boardString)
      const rows = gameData.boardString.split(';')
      boardData = rows.map((rowString) =>
        rowString.split(',').map((cell) => 
          cell === 'null' || cell === '' ? null : cell
        )
      )
      console.log('Converted board data:', boardData)
    } else if (gameData.board && Array.isArray(gameData.board)) {
      // Fallback to old board format if it exists
      boardData = gameData.board
    }
    
    setBoard(boardData)
    setCurrentPlayer(gameData.currentPlayer || 'red')
    setWinner(gameData.winner)
    setIsDraw(gameData.isDraw || false)
    
    if (gameData.winningPieces) {
      setWinningPieces(gameData.winningPieces)
    }
    
    // Play sound for winner
    if (gameData.winner && gameData.winner !== winner) {
      SoundManager.playWinSound()
    }
    
    // Handle player disconnect
    if (gameData.playerDisconnected) {
      setConnectionError(`${gameData.playerDisconnected} has disconnected`)
      setIsWaiting(true)
    }
  }, [winner])
  
  // Initialize room based on mode
  useEffect(() => {
    const initializeRoom = async () => {
      onlineGameRef.current = new OnlineGameManager()
      
      if (mode === 'create') {
        try {
          const roomId = await onlineGameRef.current.createRoom(
            playerName,
            handleOnlineGameUpdate,
            (error) => {
              console.error('Game error:', error)
              setConnectionError('Failed to create room. Please try again.')
            }
          )
          
          console.log('Room created with ID:', roomId)
          setRoomCode(roomId)
          playerColorRef.current = 'red'
          setIsWaiting(true)
          setIsConnected(true)
        } catch (error) {
          console.error('Failed to create room:', error)
          setConnectionError('Failed to create room. Please check your internet connection.')
        }
      } else if (mode === 'join') {
        try {
          await onlineGameRef.current.joinRoom(
            roomCodeInput,
            playerName,
            handleOnlineGameUpdate,
            (error) => {
              console.error('Game error:', error)
              if (error.message?.includes('not found')) {
                setConnectionError('Room not found! Please check the room code.')
              } else {
                setConnectionError('Failed to join room. Please try again.')
              }
            }
          )
          
          setRoomCode(roomCodeInput)
          playerColorRef.current = 'yellow'
          setIsConnected(true)
        } catch (error) {
          console.error('Failed to join room:', error)
          setConnectionError('Failed to join room. Please check the room code.')
        }
      }
    }
    
    initializeRoom()
    
    // Start connection health check
    const cleanup = connectionHealthCheck()
    
    // Cleanup on unmount
    return () => {
      if (onlineGameRef.current) {
        onlineGameRef.current.disconnect()
        onlineGameRef.current = null
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (cleanup) cleanup()
    }
  }, [mode, playerName, roomCodeInput, handleOnlineGameUpdate, connectionHealthCheck])
  
  // Check winner helper
  const checkWinner = (board, row, col, player) => {
    const checkDirection = (deltaRow, deltaCol) => {
      let count = 1
      let positions = [{ row, col }]
      
      // Check forward direction
      for (let i = 1; i < 4; i++) {
        const newRow = row + deltaRow * i
        const newCol = col + deltaCol * i
        if (
          newRow >= 0 && newRow < 6 &&
          newCol >= 0 && newCol < 7 &&
          board[newRow][newCol] === player
        ) {
          count++
          positions.push({ row: newRow, col: newCol })
        } else {
          break
        }
      }
      
      // Check backward direction
      for (let i = 1; i < 4; i++) {
        const newRow = row - deltaRow * i
        const newCol = col - deltaCol * i
        if (
          newRow >= 0 && newRow < 6 &&
          newCol >= 0 && newCol < 7 &&
          board[newRow][newCol] === player
        ) {
          count++
          positions.unshift({ row: newRow, col: newCol })
        } else {
          break
        }
      }
      
      return count >= 4 ? positions.slice(0, 4) : null
    }
    
    const horizontal = checkDirection(0, 1)
    const vertical = checkDirection(1, 0)
    const diagonal1 = checkDirection(1, 1)
    const diagonal2 = checkDirection(1, -1)
    
    const winningLine = horizontal || vertical || diagonal1 || diagonal2
    return winningLine
      ? { hasWinner: true, winningPieces: winningLine }
      : { hasWinner: false, winningPieces: [] }
  }
  
  // Check draw helper
  const checkDraw = (board) => {
    return board[0].every((cell) => cell !== null)
  }
  
  // Handle disc drop
  const dropDisc = async (col) => {
    // Validation checks
    if (winner || isDraw) return
    if (isWaiting) {
      alert('Waiting for opponent to join!')
      return
    }
    if (connectionError) {
      alert('Connection error. Please wait for reconnection...')
      return
    }
    
    // Check if it's player's turn
    console.log('Online mode click - currentPlayer:', currentPlayer, 'playerColor:', playerColorRef.current)
    if (currentPlayer !== playerColorRef.current) {
      console.log("It's not your turn! Current turn:", currentPlayer, "Your color:", playerColorRef.current)
      return
    }
    
    // Find available row
    for (let row = 5; row >= 0; row--) {
      if (board[row][col] === null) {
        const newBoard = board.map((row) => [...row])
        newBoard[row][col] = currentPlayer
        
        SoundManager.playDropSound()
        
        const winResult = checkWinner(newBoard, row, col, currentPlayer)
        const hasWinner = winResult.hasWinner
        const hasDraw = !hasWinner && checkDraw(newBoard)
        
        console.log('Updating game state with new board...')
        const updateData = {
          board: newBoard,
          currentPlayer: currentPlayer === 'red' ? 'yellow' : 'red',
          winner: hasWinner ? currentPlayer : null,
          winningPieces: hasWinner ? winResult.winningPieces : [],
          isDraw: hasDraw,
          lastMove: { row, col, player: currentPlayer }
        }
        
        try {
          // Convert board to string format for Firebase
          const boardString = updateData.board
            .map((row) => row.join(','))
            .join(';')
          const firebaseData = {
            ...updateData,
            boardString: boardString
          }
          console.log('Sending board string to Firebase:', boardString)
          await onlineGameRef.current.updateGameState(firebaseData)
          console.log('✅ Game state updated successfully')
        } catch (error) {
          console.error('❌ Failed to update game state:', error)
          setConnectionError('Failed to update game. Please check your connection.')
        }
        
        if (hasWinner) {
          SoundManager.playWinSound()
        }
        break
      }
    }
  }
  
  // Copy room code to clipboard
  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode)
      .then(() => alert(`Room code ${roomCode} copied to clipboard!`))
      .catch(() => alert('Failed to copy room code'))
  }
  
  // Toggle mute
  const toggleMute = () => {
    const muted = SoundManager.toggleMute()
    setIsMuted(muted)
  }
  
  // Handle leaving game
  const handleLeaveGame = () => {
    if (onlineGameRef.current) {
      onlineGameRef.current.disconnect()
    }
    onBackToMenu()
  }
  
  // Render error state
  if (connectionError && !isConnected) {
    return (
      <div className="app">
        <div className="connection-error">
          <h2>Connection Error</h2>
          <p>{connectionError}</p>
          <div className="error-controls">
            <button onClick={attemptReconnect} className="menu-button">
              Retry Connection
            </button>
            <button onClick={handleLeaveGame} className="menu-button">
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // Main render
  return (
    <div className="app">
      {/* Background decoration */}
      <div className="background-characters">
        <img src="/images/characters/tai.png" className="character char-1" alt="" />
        <img src="/images/characters/siole.png" className="character char-2" alt="" />
        <img src="/images/characters/gianni.png" className="character char-3" alt="" />
        <img src="/images/characters/jon.png" className="character char-4" alt="" />
        <img src="/images/characters/tai.png" className="character char-5" alt="" />
      </div>
      
      {/* Room code display */}
      <div className="game-header">
        {roomCode && (
          <div className="room-code">
            <div className="code-label">Share this code with your friend:</div>
            <div className="code-display">
              <span className="code">{roomCode}</span>
              <button className="copy-button" onClick={copyRoomCode}>
                📋 Copy
              </button>
            </div>
            {isWaiting && (
              <div className="waiting">Waiting for opponent to join...</div>
            )}
            {connectionError && (
              <div className="connection-warning">{connectionError}</div>
            )}
          </div>
        )}
      </div>
      
      {/* Player information */}
      <div className="players-info">
        <div className={`player-info ${currentPlayer === 'red' ? 'active' : ''}`}>
          <span className="player-indicator red"></span>
          <span className="player-name">
            {playerColorRef.current === 'red' ? playerName : opponentName || 'Waiting...'}
          </span>
        </div>
        <div className={`player-info ${currentPlayer === 'yellow' ? 'active' : ''}`}>
          <span className="player-indicator yellow"></span>
          <span className="player-name">
            {playerColorRef.current === 'yellow' ? playerName : opponentName || 'Waiting...'}
          </span>
        </div>
      </div>
      
      {/* Game status */}
      <div className="game-info">
        {winner ? (
          <div className="winner-message">
            <span className={`player-indicator ${winner}`}></span>
            {winner === playerColorRef.current ? 'You win!' : `${opponentName} wins!`}
          </div>
        ) : isDraw ? (
          <div className="draw-message">It's a draw!</div>
        ) : isWaiting ? (
          <div className="waiting-message">Waiting for opponent to join...</div>
        ) : (
          <div className="current-turn">
            {currentPlayer === playerColorRef.current 
              ? 'Your turn' 
              : `${opponentName}'s turn`}
          </div>
        )}
      </div>
      
      {/* Game board */}
      <Board 
        board={board} 
        onColumnClick={dropDisc} 
        winningPieces={winningPieces} 
      />
      
      {/* Game controls */}
      <div className="game-controls">
        <button className="reset-button" onClick={handleLeaveGame}>
          Leave Game
        </button>
        <button className="mute-button" onClick={toggleMute}>
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </button>
        {winner && (
          <button 
            className="rematch-button" 
            onClick={() => {
              // Request rematch logic would go here
              alert('Rematch feature coming soon!')
            }}
          >
            Request Rematch
          </button>
        )}
      </div>
    </div>
  )
}

export default OnlineMode