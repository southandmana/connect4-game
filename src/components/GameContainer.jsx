import React, { useEffect, useRef, useCallback } from 'react'
import Board from './Board'
import PlayerCard from './PlayerCard'
import useGameState from '../hooks/useGameState'
import OnlineGameManager from '../utils/OnlineGameManager'
import SoundManager from '../utils/SoundManager'

function GameContainer({ 
  gameMode, 
  onGameComplete, 
  onBackToMenu,
  // Arcade mode props
  selectedCharacter,
  currentAI,
  tournamentManager,
  // Online mode props
  playerColorRef,
  onlineGameRef,
  roomCode,
  playerName,
  opponentName
}) {
  const gameState = useGameState()
  const aiMoveTimeoutRef = useRef(null)
  const stressTimerRef = useRef(null)

  const {
    board,
    currentPlayer,
    winner,
    isDraw,
    winningPieces,
    isPlayerTurn,
    playerStress,
    opponentStress,
    turnDuration,
    maxTurnTime,
    turnStartTime,
    playerCumulativeTime,
    opponentCumulativeTime,
    isMuted,
    makeMove,
    setBoard,
    setCurrentPlayer,
    setWinner,
    setWinningPieces,
    setPlayerTurn,
    updateTimer,
    setPlayerStress,
    setOpponentStress,
    setTurnStart,
    setCumulativeTime,
    resetBoard,
    toggleMute,
    checkWinner,
    checkDraw
  } = gameState

  // AI move logic for arcade mode
  const makeAIMove = useCallback(() => {
    if (!currentAI || winner || isDraw) return

    // Always use the current board state from the hook
    const currentBoard = board
    const aiCol = currentAI.getMove(currentBoard)
    console.log("🤖 AI chose column:", aiCol)
    console.log("🤖 Board state before AI move:", currentBoard.map(row => row.map(cell => cell || ".")))
    
    if (aiCol === -1) return // No valid moves

    // Use the proper makeMove function instead of directly setting board
    const result = makeMove(aiCol, "yellow")
    console.log("🤖 makeMove result:", result)
    if (result.success) {
      SoundManager.playDropSound()

      if (result.winResult.hasWinner) {
        setWinner("yellow")
        setWinningPieces(result.winResult.winningPieces)
        SoundManager.playWinSound()
        setTimeout(() => {
          onGameComplete(false, 'opponent') // AI won (player lost)
        }, 3500)
      } else if (result.isDraw) {
        onGameComplete(false, 'opponent') // Draw (counts as loss in tournament)
      } else {
        // Save current turn elapsed time and calculate AI stress relief using refs
        if (turnStartRef.current) {
          const currentTurnElapsed = (Date.now() - turnStartRef.current) / 1000
          const newAICumulative = opponentCumulativeRef.current + currentTurnElapsed
          
          // Calculate AI stress relief for completing the turn
          const baseTurnRelief = 3 // 3% base relief for any completed turn
          const quickPlayBonus = currentTurnElapsed < 5 ? (5 - currentTurnElapsed) * 2 : 0
          const totalRelief = baseTurnRelief + quickPlayBonus
          
          // Apply stress relief (convert % to seconds of relief)
          const stressReliefInSeconds = (totalRelief / 100) * maxTurnTime
          const relievedCumulativeTime = Math.max(0, newAICumulative - stressReliefInSeconds)
          
          console.log(`🤖 AI turn relief: ${totalRelief.toFixed(1)}% (${stressReliefInSeconds.toFixed(1)}s) - Turn time: ${currentTurnElapsed.toFixed(1)}s`)
          
          // Update refs and state
          opponentCumulativeRef.current = relievedCumulativeTime
          setCumulativeTime(undefined, relievedCumulativeTime)
        }
        
        // Switch back to player turn
        setCurrentPlayer("red")
        setPlayerTurn(true)
      }
    }
  }, [board, currentAI, winner, isDraw, maxTurnTime, makeMove, setWinner, setWinningPieces, setCurrentPlayer, setPlayerTurn, setCumulativeTime, onGameComplete, checkWinner, checkDraw])

  // Handle online game updates
  const handleOnlineGameUpdate = useCallback((gameData) => {
    // Convert board string from Firebase back to array
    let boardData = Array(6).fill(null).map(() => Array(7).fill(null))
    if (gameData.boardString) {
      console.log("Converting board string from Firebase:", gameData.boardString)
      const rows = gameData.boardString.split(";")
      boardData = rows.map((rowString) =>
        rowString.split(",").map((cell) => (cell === "null" || cell === "" ? null : cell))
      )
      console.log("Converted board data:", boardData)
    } else if (gameData.board && Array.isArray(gameData.board)) {
      boardData = gameData.board
    }

    console.log("Setting board to:", boardData)
    setBoard(boardData)
    setCurrentPlayer(gameData.currentPlayer || "red")
    setWinner(gameData.winner)
    
    if (gameData.winner && gameData.winner !== winner) {
      SoundManager.playWinSound()
    }
  }, [winner, setBoard, setCurrentPlayer, setWinner])

  // Main drop disc function
  const dropDisc = useCallback(async (col) => {
    if (winner || isDraw) return

    if (gameMode === "create" || gameMode === "join") {
      // Online multiplayer mode
      console.log("Online mode click - currentPlayer:", currentPlayer, "playerColor:", playerColorRef.current)
      if (currentPlayer !== playerColorRef.current) {
        console.log("It's not your turn! Current turn:", currentPlayer, "Your color:", playerColorRef.current)
        return
      }

      for (let row = 5; row >= 0; row--) {
        if (board[row][col] === null) {
          const newBoard = board.map((row) => [...row])
          newBoard[row][col] = currentPlayer

          SoundManager.playDropSound()

          const winResult = checkWinner(newBoard, row, col, currentPlayer)
          const hasWinner = winResult.hasWinner
          const hasDraw = !hasWinner && checkDraw(newBoard)

          console.log("Updating game state with new board...")
          const updateData = {
            board: newBoard,
            currentPlayer: currentPlayer === "red" ? "yellow" : "red",
            winner: hasWinner ? currentPlayer : null,
            winningPieces: hasWinner ? winResult.winningPieces : [],
            isDraw: hasDraw,
            lastMove: { row, col, player: currentPlayer }
          }

          try {
            // Convert board to string format for Firebase
            const boardString = updateData.board.map((row) => row.join(",")).join(";")
            const firebaseData = { ...updateData, boardString: boardString }
            console.log("Sending board string to Firebase:", boardString)
            await onlineGameRef.current.updateGameState(firebaseData)
            console.log("✅ Game state updated successfully")
          } catch (error) {
            console.error("❌ Failed to update game state:", error)
          }

          if (hasWinner) {
            SoundManager.playWinSound()
          }
          break
        }
      }
    } else if (gameMode === "arcade") {
      // Arcade mode with AI opponent
      if (!isPlayerTurn || currentPlayer !== "red") return

      const result = makeMove(col, "red")
      if (result.success) {
        SoundManager.playDropSound()

        if (result.winResult.hasWinner) {
          setWinner("red")
          setWinningPieces(result.winResult.winningPieces)
          SoundManager.playWinSound()
          setTimeout(() => {
            onGameComplete(true) // Player won
          }, 3500)
        } else if (result.isDraw) {
          onGameComplete(false, 'opponent') // Draw (counts as loss in tournament)
        } else {
          // Save current turn elapsed time and calculate stress relief using refs
          if (turnStartRef.current) {
            const currentTurnElapsed = (Date.now() - turnStartRef.current) / 1000
            const newPlayerCumulative = playerCumulativeRef.current + currentTurnElapsed
            
            // Calculate stress relief for completing the turn
            const baseTurnRelief = 3 // 3% base relief for any completed turn
            const quickPlayBonus = currentTurnElapsed < 5 ? (5 - currentTurnElapsed) * 2 : 0
            const totalRelief = baseTurnRelief + quickPlayBonus
            
            // Apply stress relief (convert % to seconds of relief)
            const stressReliefInSeconds = (totalRelief / 100) * maxTurnTime
            const relievedCumulativeTime = Math.max(0, newPlayerCumulative - stressReliefInSeconds)
            
            console.log(`🎯 Player turn relief: ${totalRelief.toFixed(1)}% (${stressReliefInSeconds.toFixed(1)}s) - Turn time: ${currentTurnElapsed.toFixed(1)}s`)
            
            // Update refs and state
            playerCumulativeRef.current = relievedCumulativeTime
            setCumulativeTime(relievedCumulativeTime, undefined)
          }
          
          // Switch to AI turn
          setCurrentPlayer("yellow")
          setPlayerTurn(false)

          // AI makes move after delay
          aiMoveTimeoutRef.current = setTimeout(() => {
            // Apply AI thinking time stress relief to player using refs
            const aiThinkingRelief = 1.0 // 1 second of AI thinking = 1 second of stress relief
            playerCumulativeRef.current = Math.max(0, playerCumulativeRef.current - aiThinkingRelief)
            setCumulativeTime(playerCumulativeRef.current, undefined)
            console.log(`🤖 AI thinking relief: ${aiThinkingRelief}s stress relief for player`)
            
            makeAIMove()
          }, 1000) // 1 second delay for dramatic effect
        }
      }
    } else {
      // Local play mode (fallback)
      const result = makeMove(col, currentPlayer)
      if (result.success) {
        SoundManager.playDropSound()

        if (result.winResult.hasWinner) {
          setWinner(currentPlayer)
          setWinningPieces(result.winResult.winningPieces)
          SoundManager.playWinSound()
        }
      }
    }
  }, [
    winner, isDraw, gameMode, currentPlayer, playerColorRef, board, isPlayerTurn, 
    turnStartTime, playerCumulativeTime, maxTurnTime, onlineGameRef, makeMove, 
    setWinner, setWinningPieces, setCurrentPlayer, setPlayerTurn, setCumulativeTime,
    onGameComplete, makeAIMove, checkWinner, checkDraw
  ])

  // Fixed stress & timer system - using refs to avoid stale closures
  const playerCumulativeRef = useRef(0)
  const opponentCumulativeRef = useRef(0)
  const turnStartRef = useRef(Date.now())

  // Update refs when state changes
  useEffect(() => {
    playerCumulativeRef.current = playerCumulativeTime
  }, [playerCumulativeTime])

  useEffect(() => {
    opponentCumulativeRef.current = opponentCumulativeTime  
  }, [opponentCumulativeTime])

  useEffect(() => {
    // Clear all timers when not in active game
    if (!currentAI || winner || isDraw || gameMode !== "arcade") {
      if (stressTimerRef.current) {
        clearInterval(stressTimerRef.current)
        stressTimerRef.current = null
      }
      return
    }

    // Start timing from current turn
    const turnStart = Date.now()
    turnStartRef.current = turnStart
    setTurnStart(turnStart)
    updateTimer(0, turnStart)

    // Clear existing timer before creating new one
    if (stressTimerRef.current) clearInterval(stressTimerRef.current)

    console.log(`🎯 Starting timer for ${isPlayerTurn ? 'PLAYER' : 'AI'} turn. Player cumulative: ${playerCumulativeRef.current}s, AI cumulative: ${opponentCumulativeRef.current}s`)

    // Update timer every second
    stressTimerRef.current = setInterval(() => {
      const now = Date.now()
      const currentTurnElapsed = (now - turnStartRef.current) / 1000
      
      // Update duration for visual timer (current turn only)
      updateTimer(currentTurnElapsed)

      // Calculate and update stress levels using refs for current values
      if (isPlayerTurn) {
        const totalCumulativeTime = playerCumulativeRef.current + currentTurnElapsed
        const cumulativeStress = Math.min(100, (totalCumulativeTime / maxTurnTime) * 100)
        setPlayerStress(cumulativeStress)
        
        // Give AI slight relief during player thinking time
        opponentCumulativeRef.current = Math.max(0, opponentCumulativeRef.current - 0.5)
        
        // Check for timeout/stress death
        if (totalCumulativeTime >= maxTurnTime) {
          console.log(`⏰ Player stress timeout! Total time: ${totalCumulativeTime}s`)
          
          if (stressTimerRef.current) {
            clearInterval(stressTimerRef.current)
            stressTimerRef.current = null
          }

          setWinner("yellow")
          setTimeout(() => {
            onGameComplete(false, 'stress')
          }, 1500)
          return
        }
      } else {
        const totalCumulativeTime = opponentCumulativeRef.current + currentTurnElapsed
        const cumulativeStress = Math.min(100, (totalCumulativeTime / maxTurnTime) * 100)
        setOpponentStress(cumulativeStress)
        
        // Check for AI timeout (shouldn't happen but safety check)
        if (totalCumulativeTime >= maxTurnTime) {
          console.log(`⏰ AI stress timeout! Total time: ${totalCumulativeTime}s`)
          
          if (stressTimerRef.current) {
            clearInterval(stressTimerRef.current)
            stressTimerRef.current = null
          }

          setWinner("red")
          setTimeout(() => {
            onGameComplete(true)
          }, 1500)
          return
        }
      }
    }, 1000)

    return () => {
      if (stressTimerRef.current) {
        clearInterval(stressTimerRef.current)
        stressTimerRef.current = null
      }
    }
  }, [isPlayerTurn, currentAI, winner, isDraw, gameMode]) // Removed frequently changing dependencies

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (aiMoveTimeoutRef.current) {
        clearTimeout(aiMoveTimeoutRef.current)
        aiMoveTimeoutRef.current = null
      }
      if (stressTimerRef.current) {
        clearInterval(stressTimerRef.current)
        stressTimerRef.current = null
      }
    }
  }, [])

  // Initialize online game updates
  useEffect(() => {
    if (onlineGameRef?.current && (gameMode === "create" || gameMode === "join")) {
      // Set up online game update handler
      onlineGameRef.current.onGameUpdate = handleOnlineGameUpdate
    }
  }, [gameMode, handleOnlineGameUpdate])

  if (gameMode === "arcade" && currentAI) {
    // Arcade tournament gameplay

    return (
      <div className="game-container">

        {/* Character Battle Interface */}
        <div className="battle-interface">
          <div className="fighters-display">
            <PlayerCard
              character={selectedCharacter}
              characterName={selectedCharacter?.name || "Player"}
              isActive={isPlayerTurn && !winner && !isDraw}
              isPlayer={true}
              stressLevel={playerStress}
              turnDuration={turnDuration}
              maxTurnTime={maxTurnTime}
            />
            
            <div className="vs-divider">
              <div className="vs-text">VS</div>
              {winner ? (
                <div className="battle-result">
                  {winner === "red" ? "🏆 VICTORY!" : "💀 DEFEAT!"}
                </div>
              ) : isDraw ? (
                <div className="battle-result">⚖️ DRAW!</div>
              ) : (
                <div className="battle-status">
                  {isPlayerTurn ? "Your Move" : `${currentAI.name}'s Move`}
                </div>
              )}
            </div>

            <PlayerCard
              character={null}
              characterName={currentAI.name}
              isActive={!isPlayerTurn && !winner && !isDraw}
              isPlayer={false}
              stressLevel={opponentStress}
              turnDuration={turnDuration}
              maxTurnTime={maxTurnTime}
            />
          </div>
        </div>

        <Board board={board} onColumnClick={dropDisc} winningPieces={winningPieces} />

        <div className="game-controls">
          <button className="reset-button" onClick={onBackToMenu}>
            Quit Tournament
          </button>
          <button className="mute-button" onClick={toggleMute}>
            {isMuted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
        </div>
      </div>
    )
  }

  // Online/Local multiplayer mode
  return (
    <div className="game-container">
      <div className="players-info">
        <div className={`player-info ${currentPlayer === "red" ? "active" : ""}`}>
          <span className="player-indicator red"></span>
          <span className="player-name">
            {playerColorRef?.current === "red" ? playerName : 
             gameMode === "local" ? playerName : opponentName}
          </span>
        </div>
        <div className={`player-info ${currentPlayer === "yellow" ? "active" : ""}`}>
          <span className="player-indicator yellow"></span>
          <span className="player-name">
            {playerColorRef?.current === "yellow" ? playerName : opponentName}
          </span>
        </div>
      </div>

      <div className="game-info">
        {winner ? (
          <div className="winner-message">
            <span className={`player-indicator ${winner}`}></span>
            {winner === playerColorRef?.current ? "You win!" :
             gameMode === "local" ? `${winner === "red" ? playerName : opponentName} wins!` :
             `${opponentName} wins!`}
          </div>
        ) : isDraw ? (
          <div className="draw-message">It's a draw!</div>
        ) : (
          <div className="current-turn">
            {gameMode === "create" || gameMode === "join" ?
              (currentPlayer === playerColorRef?.current ? "Your turn" : `${opponentName}'s turn`) :
              (currentPlayer === "red" ? `${playerName}'s turn` : `${opponentName}'s turn`)}
          </div>
        )}
      </div>

      <Board board={board} onColumnClick={dropDisc} winningPieces={winningPieces} />

      <div className="game-controls">
        <button className="reset-button" onClick={onBackToMenu}>
          Back to Menu
        </button>
        <button className="mute-button" onClick={toggleMute}>
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      </div>
    </div>
  )
}

export default GameContainer