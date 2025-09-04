import React, { useState, useEffect, useRef } from 'react'
import Board from './components/Board'
import MainMenu from './components/MainMenu'
import CharacterSelection from './components/CharacterSelection'
import Cinematic from './components/Cinematic'
import VSScreen from './components/VSScreen'
import OnlineGameManager from './utils/OnlineGameManager'
import SoundManager from './utils/SoundManager'
import TournamentManager from './utils/TournamentManager'
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
  
  // Arcade mode specific state
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [arcadeStage, setArcadeStage] = useState('characterSelect') // 'characterSelect', 'openingCinematic', 'vsScreen', 'game', 'endingCinematic', etc.
  const [tournamentManager, setTournamentManager] = useState(null)
  const [currentAI, setCurrentAI] = useState(null)
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  
  const onlineGameRef = useRef(null)
  const playerColorRef = useRef(null)
  const aiMoveTimeoutRef = useRef(null)

  useEffect(() => {
    SoundManager.init()
    if (gameMode) {
      SoundManager.playBackgroundMusic()
    }
    
    // Test Firebase connection
    import('./firebase').then(({ database }) => {
      import('firebase/database').then(({ ref, set }) => {
        const testRef = ref(database, 'test')
        set(testRef, { message: 'Firebase connected!', timestamp: Date.now() })
          .then(() => console.log('Firebase test write successful'))
          .catch((error) => console.error('Firebase test write failed:', error))
      })
    })
    
    // Only disconnect when component unmounts, not when gameMode changes
    return () => {
      SoundManager.stopBackgroundMusic()
    }
  }, [gameMode])
  
  // Separate useEffect for cleanup on unmount only
  useEffect(() => {
    return () => {
      if (onlineGameRef.current) {
        onlineGameRef.current.disconnect()
      }
    }
  }, [])

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
    
    // Convert board string from Firebase back to array
    let boardData = Array(6).fill(null).map(() => Array(7).fill(null))
    if (gameData.boardString) {
      console.log('Converting board string from Firebase:', gameData.boardString)
      const rows = gameData.boardString.split(';')
      boardData = rows.map(rowString => 
        rowString.split(',').map(cell => (cell === 'null' || cell === '') ? null : cell)
      )
      console.log('Converted board data:', boardData)
    } else if (gameData.board && Array.isArray(gameData.board)) {
      // Fallback to old board format if it exists and is an array
      boardData = gameData.board
    }
    
    console.log('Setting board to:', boardData)
    setBoard(boardData)
    setCurrentPlayer(gameData.currentPlayer || 'red')
    setWinner(gameData.winner)
    setIsDraw(gameData.isDraw || false)
    
    if (gameData.winner && gameData.winner !== winner) {
      SoundManager.playWinSound()
    }
  }

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character)
    setPlayerName(character.name)
    setArcadeStage('openingCinematic')
  }

  const handleCinematicComplete = () => {
    // After opening cinematic, start tournament with VS screen
    const tournament = new TournamentManager()
    const firstAI = tournament.startTournament()
    setTournamentManager(tournament)
    setCurrentAI(firstAI)
    setArcadeStage('vsScreen')
  }

  const handleVSScreenComplete = () => {
    // After VS screen, start the actual game
    setArcadeStage('game')
    setBoard(Array(6).fill(null).map(() => Array(7).fill(null)))
    setCurrentPlayer('red') // Player always goes first
    setWinner(null)
    setIsDraw(false)
    setIsPlayerTurn(true)
  }

  const handleGameComplete = (playerWon) => {
    if (!tournamentManager) return
    
    const result = tournamentManager.handleMatchResult(playerWon)
    
    if (result.tournamentComplete) {
      // Tournament is over - show ending cinematic
      setArcadeStage('endingCinematic')
    } else if (result.advance) {
      // Player won, advance to next opponent
      setCurrentAI(result.nextOpponent)
      setArcadeStage('vsScreen')
    }
  }

  const handleBackToMenu = () => {
    // Clear AI timeout if running
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current)
      aiMoveTimeoutRef.current = null
    }
    
    setGameMode(null)
    setArcadeStage('characterSelect')
    setSelectedCharacter(null)
    setTournamentManager(null)
    setCurrentAI(null)
    setIsPlayerTurn(true)
  }

  const handleStartGame = async (mode, name, code = null) => {
    // Handle arcade mode separately (doesn't need online setup)
    if (mode === 'arcade') {
      setGameMode(mode)
      setArcadeStage('characterSelect')
      return
    }
    
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
        console.log('Room created with ID:', roomId)
        setRoomCode(roomId)
        playerColorRef.current = 'red'
        setIsWaiting(true)
        console.log('Room code state set to:', roomId)
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

  const makeAIMove = (currentBoard) => {
    if (!currentAI || winner || isDraw) return
    
    const aiCol = currentAI.getMove(currentBoard)
    if (aiCol === -1) return // No valid moves
    
    const newBoard = currentBoard.map(row => [...row])
    
    for (let row = 5; row >= 0; row--) {
      if (newBoard[row][aiCol] === null) {
        newBoard[row][aiCol] = 'yellow' // AI is always yellow
        setBoard(newBoard)
        
        SoundManager.playDropSound()
        
        if (checkWinner(newBoard, row, aiCol, 'yellow')) {
          setWinner('yellow')
          SoundManager.playWinSound()
          handleGameComplete(false) // AI won (player lost)
        } else if (checkDraw(newBoard)) {
          setIsDraw(true)
          handleGameComplete(false) // Draw (counts as loss in tournament)
        } else {
          // Switch back to player turn
          setCurrentPlayer('red')
          setIsPlayerTurn(true)
        }
        break
      }
    }
  }

  const dropDisc = async (col) => {
    if (winner || isDraw) return
    
    if (gameMode === 'create' || gameMode === 'join') {
      if (isWaiting) {
        alert('Waiting for opponent to join!')
        return
      }
      
      console.log('Online mode click - currentPlayer:', currentPlayer, 'playerColor:', playerColorRef.current)
      if (currentPlayer !== playerColorRef.current) {
        console.log("It's not your turn! Current turn:", currentPlayer, "Your color:", playerColorRef.current)
        return
      }
      console.log("It's your turn, proceeding with move")
      
      for (let row = 5; row >= 0; row--) {
        if (board[row][col] === null) {
          const newBoard = board.map(row => [...row])
          newBoard[row][col] = currentPlayer
          
          SoundManager.playDropSound()
          
          const hasWinner = checkWinner(newBoard, row, col, currentPlayer)
          const hasDraw = !hasWinner && checkDraw(newBoard)
          
          console.log('Updating game state with new board...')
          const updateData = {
            board: newBoard,
            currentPlayer: currentPlayer === 'red' ? 'yellow' : 'red',
            winner: hasWinner ? currentPlayer : null,
            isDraw: hasDraw,
            lastMove: { row, col, player: currentPlayer }
          }
          console.log('Update data:', updateData)
          
          try {
            // Convert board to string format for Firebase (Firebase doesn't handle nested arrays well)
            const boardString = updateData.board.map(row => row.join(',')).join(';')
            const firebaseData = {
              ...updateData,
              boardString: boardString
            }
            console.log('Sending board string to Firebase:', boardString)
            await onlineGameRef.current.updateGameState(firebaseData)
            console.log('✅ Game state updated successfully')
          } catch (error) {
            console.error('❌ Failed to update game state:', error)
          }
          
          if (hasWinner) {
            SoundManager.playWinSound()
          }
          break
        }
      }
    } else if (gameMode === 'arcade') {
      // Arcade mode with AI opponent
      if (!isPlayerTurn || currentPlayer !== 'red') return
      
      const newBoard = board.map(row => [...row])
      
      for (let row = 5; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          newBoard[row][col] = 'red' // Player is always red
          setBoard(newBoard)
          
          SoundManager.playDropSound()
          
          if (checkWinner(newBoard, row, col, 'red')) {
            setWinner('red')
            SoundManager.playWinSound()
            handleGameComplete(true) // Player won
          } else if (checkDraw(newBoard)) {
            setIsDraw(true)
            handleGameComplete(false) // Draw (counts as loss in tournament)
          } else {
            // Switch to AI turn
            setCurrentPlayer('yellow')
            setIsPlayerTurn(false)
            
            // AI makes move after delay
            aiMoveTimeoutRef.current = setTimeout(() => {
              makeAIMove(newBoard)
            }, 1000) // 1 second delay for dramatic effect
          }
          break
        }
      }
    } else {
      // Local play mode (fallback)
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
    
    // Reset arcade mode state
    setSelectedCharacter(null)
    setArcadeStage('characterSelect')
    setTournamentManager(null)
    setCurrentAI(null)
    setIsPlayerTurn(true)
    
    // Clear AI timeout if running
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current)
      aiMoveTimeoutRef.current = null
    }
  }

  const toggleMute = () => {
    const muted = SoundManager.toggleMute()
    setIsMuted(muted)
  }

  if (!gameMode) {
    return <MainMenu onStartGame={handleStartGame} />
  }

  // Arcade mode system
  if (gameMode === 'arcade') {
    if (arcadeStage === 'characterSelect') {
      return (
        <CharacterSelection 
          onCharacterSelect={handleCharacterSelect}
          onBack={handleBackToMenu}
        />
      )
    }
    
    if (arcadeStage === 'openingCinematic') {
      return (
        <Cinematic 
          character={selectedCharacter}
          type="opening"
          onComplete={handleCinematicComplete}
        />
      )
    }
    
    if (arcadeStage === 'vsScreen' && currentAI && tournamentManager) {
      return (
        <VSScreen
          playerCharacter={selectedCharacter}
          opponentName={currentAI.name}
          opponentNumber={tournamentManager.currentOpponent}
          opponentDescription={tournamentManager.getOpponentDescription()}
          onComplete={handleVSScreenComplete}
        />
      )
    }
    
    if (arcadeStage === 'game' && currentAI) {
      // Arcade tournament gameplay
      const progress = tournamentManager?.getProgress()
      const difficultyInfo = tournamentManager?.getDifficultyInfo()
      
      return (
        <div className="app">
          {/* Tournament Info Header */}
          <div className="tournament-header">
            <div className="tournament-progress">
              <h3>🏆 Tournament Progress: {progress?.currentOpponent}/10</h3>
              <p>Opponent: {currentAI.name} ({difficultyInfo?.name})</p>
              {difficultyInfo?.isFinalBoss && <p className="final-boss-indicator">👑 FINAL BOSS!</p>}
            </div>
          </div>
          
          <div className="players-info">
            <div className={`player-info ${currentPlayer === 'red' ? 'active' : ''}`}>
              <span className="player-indicator red"></span>
              <span className="player-name">{selectedCharacter?.name || 'Player'}</span>
            </div>
            <div className={`player-info ${currentPlayer === 'yellow' ? 'active' : ''}`}>
              <span className="player-indicator yellow"></span>
              <span className="player-name">{currentAI.name}</span>
            </div>
          </div>
          
          <div className="game-info">
            {winner ? (
              <div className="winner-message">
                <span className={`player-indicator ${winner}`}></span>
                {winner === 'red' ? 'Victory!' : 'Defeat!'}
              </div>
            ) : isDraw ? (
              <div className="draw-message">Draw!</div>
            ) : (
              <div className="current-turn">
                {isPlayerTurn ? "Your turn" : `${currentAI.name}'s turn`}
              </div>
            )}
          </div>
          
          <Board board={board} onColumnClick={dropDisc} />
          
          <div className="game-controls">
            <button className="reset-button" onClick={resetGame}>
              Quit Tournament
            </button>
            <button className="mute-button" onClick={toggleMute}>
              {isMuted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
          </div>
        </div>
      )
    }
    
    if (arcadeStage === 'endingCinematic') {
      return (
        <Cinematic 
          character={selectedCharacter}
          type="ending"
          onComplete={() => {
            // After ending cinematic, return to menu
            resetGame()
          }}
        />
      )
    }
    
    // Fallback placeholder for any other stages
    return (
      <div className="app">
        <div className="arcade-placeholder">
          <h1>🎮 Arcade Stage: {arcadeStage}</h1>
          <p>Selected Character: {selectedCharacter?.name}</p>
          <p>Current AI: {currentAI?.name}</p>
          <button className="reset-button" onClick={resetGame}>
            Back to Menu
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* Background Characters */}
      <div className="background-characters">
        <img src="/images/southern.png" className="character char-1" alt="" />
        <img src="/images/southern.png" className="character char-2" alt="" />
        <img src="/images/southern.png" className="character char-3" alt="" />
        <img src="/images/southern.png" className="character char-4" alt="" />
        <img src="/images/southern.png" className="character char-5" alt="" />
      </div>
      
      <div className="game-header">
        {roomCode && (
          <div className="room-code">
            <div className="code-label">Share this code with your friend:</div>
            <div className="code-display">
              <span className="code">{roomCode}</span>
              <button 
                className="copy-button"
                onClick={() => {
                  navigator.clipboard.writeText(roomCode)
                  alert(`Room code ${roomCode} copied to clipboard!`)
                }}
              >
                📋 Copy
              </button>
            </div>
            {isWaiting && <div className="waiting">Waiting for opponent to join...</div>}
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