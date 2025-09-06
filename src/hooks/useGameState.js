import { useReducer, useCallback } from 'react'

// Initial state structure
const initialState = {
  // Core game state
  board: Array(6).fill(null).map(() => Array(7).fill(null)),
  currentPlayer: 'red',
  winner: null,
  isDraw: false,
  winningPieces: [],
  
  // Game mode and players
  gameMode: null,
  playerName: '',
  opponentName: '',
  roomCode: '',
  isWaiting: false,
  
  // Arcade mode state
  selectedCharacter: null,
  arcadeStage: 'characterSelect',
  currentAI: null,
  isPlayerTurn: true,
  
  // Tournament state
  tournamentManager: null,
  
  // Stress/Timer system
  playerStress: 0,
  opponentStress: 0,
  turnStartTime: Date.now(),
  turnDuration: 0,
  maxTurnTime: 90,
  gameStartTime: null,
  totalScore: 0,
  defeatReason: null,
  playerCumulativeTime: 0,
  opponentCumulativeTime: 0,
  
  // Audio
  isMuted: false
}

// Action types
const GAME_ACTIONS = {
  // Game setup
  SET_GAME_MODE: 'SET_GAME_MODE',
  SET_PLAYER_INFO: 'SET_PLAYER_INFO',
  SET_ROOM_CODE: 'SET_ROOM_CODE',
  SET_WAITING: 'SET_WAITING',
  
  // Board actions
  MAKE_MOVE: 'MAKE_MOVE',
  SET_BOARD: 'SET_BOARD',
  SET_CURRENT_PLAYER: 'SET_CURRENT_PLAYER',
  SET_WINNER: 'SET_WINNER',
  SET_DRAW: 'SET_DRAW',
  SET_WINNING_PIECES: 'SET_WINNING_PIECES',
  
  // Arcade mode actions
  SELECT_CHARACTER: 'SELECT_CHARACTER',
  SET_ARCADE_STAGE: 'SET_ARCADE_STAGE',
  SET_CURRENT_AI: 'SET_CURRENT_AI',
  SET_PLAYER_TURN: 'SET_PLAYER_TURN',
  SET_TOURNAMENT_MANAGER: 'SET_TOURNAMENT_MANAGER',
  
  // Timer/Stress actions
  UPDATE_TIMER: 'UPDATE_TIMER',
  SET_PLAYER_STRESS: 'SET_PLAYER_STRESS',
  SET_OPPONENT_STRESS: 'SET_OPPONENT_STRESS',
  SET_TURN_START: 'SET_TURN_START',
  SET_CUMULATIVE_TIME: 'SET_CUMULATIVE_TIME',
  SET_DEFEAT_REASON: 'SET_DEFEAT_REASON',
  
  // Game control
  RESET_GAME: 'RESET_GAME',
  RESET_BOARD: 'RESET_BOARD',
  TOGGLE_MUTE: 'TOGGLE_MUTE'
}

// Game reducer
function gameReducer(state, action) {
  switch (action.type) {
    case GAME_ACTIONS.SET_GAME_MODE:
      return {
        ...state,
        gameMode: action.payload
      }
    
    case GAME_ACTIONS.SET_PLAYER_INFO:
      return {
        ...state,
        playerName: action.payload.playerName || state.playerName,
        opponentName: action.payload.opponentName || state.opponentName
      }
    
    case GAME_ACTIONS.SET_ROOM_CODE:
      return {
        ...state,
        roomCode: action.payload
      }
    
    case GAME_ACTIONS.SET_WAITING:
      return {
        ...state,
        isWaiting: action.payload
      }
    
    case GAME_ACTIONS.MAKE_MOVE:
      const { row, col, player, winResult } = action.payload
      const newBoard = state.board.map(r => [...r])
      newBoard[row][col] = player
      
      return {
        ...state,
        board: newBoard,
        currentPlayer: player === 'red' ? 'yellow' : 'red',
        winner: winResult?.hasWinner ? player : null,
        winningPieces: winResult?.winningPieces || [],
        isDraw: winResult?.isDraw || false
      }
    
    case GAME_ACTIONS.SET_BOARD:
      return {
        ...state,
        board: action.payload
      }
    
    case GAME_ACTIONS.SET_CURRENT_PLAYER:
      return {
        ...state,
        currentPlayer: action.payload
      }
    
    case GAME_ACTIONS.SET_WINNER:
      return {
        ...state,
        winner: action.payload
      }
    
    case GAME_ACTIONS.SET_DRAW:
      return {
        ...state,
        isDraw: action.payload
      }
    
    case GAME_ACTIONS.SET_WINNING_PIECES:
      return {
        ...state,
        winningPieces: action.payload
      }
    
    case GAME_ACTIONS.SELECT_CHARACTER:
      return {
        ...state,
        selectedCharacter: action.payload,
        playerName: action.payload.name
      }
    
    case GAME_ACTIONS.SET_ARCADE_STAGE:
      return {
        ...state,
        arcadeStage: action.payload
      }
    
    case GAME_ACTIONS.SET_CURRENT_AI:
      return {
        ...state,
        currentAI: action.payload
      }
    
    case GAME_ACTIONS.SET_PLAYER_TURN:
      return {
        ...state,
        isPlayerTurn: action.payload
      }
    
    case GAME_ACTIONS.SET_TOURNAMENT_MANAGER:
      return {
        ...state,
        tournamentManager: action.payload
      }
    
    case GAME_ACTIONS.UPDATE_TIMER:
      return {
        ...state,
        turnDuration: action.payload.turnDuration,
        turnStartTime: action.payload.turnStartTime || state.turnStartTime
      }
    
    case GAME_ACTIONS.SET_PLAYER_STRESS:
      return {
        ...state,
        playerStress: action.payload
      }
    
    case GAME_ACTIONS.SET_OPPONENT_STRESS:
      return {
        ...state,
        opponentStress: action.payload
      }
    
    case GAME_ACTIONS.SET_TURN_START:
      return {
        ...state,
        turnStartTime: action.payload,
        gameStartTime: state.gameStartTime || action.payload
      }
    
    case GAME_ACTIONS.SET_CUMULATIVE_TIME:
      return {
        ...state,
        playerCumulativeTime: action.payload.player !== undefined ? action.payload.player : state.playerCumulativeTime,
        opponentCumulativeTime: action.payload.opponent !== undefined ? action.payload.opponent : state.opponentCumulativeTime
      }
    
    case GAME_ACTIONS.SET_DEFEAT_REASON:
      return {
        ...state,
        defeatReason: action.payload
      }
    
    case GAME_ACTIONS.RESET_BOARD:
      return {
        ...state,
        board: Array(6).fill(null).map(() => Array(7).fill(null)),
        currentPlayer: 'red',
        winner: null,
        isDraw: false,
        winningPieces: [],
        isPlayerTurn: true,
        playerStress: 0,
        opponentStress: 0,
        turnDuration: 0,
        playerCumulativeTime: 0,
        opponentCumulativeTime: 0,
        gameStartTime: Date.now(),
        defeatReason: null
      }
    
    case GAME_ACTIONS.RESET_GAME:
      return {
        ...initialState,
        isMuted: state.isMuted // Preserve audio settings
      }
    
    case GAME_ACTIONS.TOGGLE_MUTE:
      return {
        ...state,
        isMuted: !state.isMuted
      }
    
    default:
      return state
  }
}

// Winner checking logic
function checkWinner(board, row, col, player) {
  const checkDirection = (deltaRow, deltaCol) => {
    let count = 1
    let positions = [{ row, col }]

    // Check forward direction
    for (let i = 1; i < 4; i++) {
      const newRow = row + deltaRow * i
      const newCol = col + deltaCol * i
      if (
        newRow >= 0 &&
        newRow < 6 &&
        newCol >= 0 &&
        newCol < 7 &&
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
        newRow >= 0 &&
        newRow < 6 &&
        newCol >= 0 &&
        newCol < 7 &&
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

  // Check all directions
  const horizontal = checkDirection(0, 1)
  const vertical = checkDirection(1, 0)
  const diagonal1 = checkDirection(1, 1)
  const diagonal2 = checkDirection(1, -1)

  const winningLine = horizontal || vertical || diagonal1 || diagonal2
  return winningLine
    ? { hasWinner: true, winningPieces: winningLine }
    : { hasWinner: false, winningPieces: [] }
}

// Check for draw
function checkDraw(board) {
  return board[0].every((cell) => cell !== null)
}

// Custom hook
export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  // Action creators
  const setGameMode = useCallback((mode) => {
    dispatch({ type: GAME_ACTIONS.SET_GAME_MODE, payload: mode })
  }, [])

  const setPlayerInfo = useCallback((playerName, opponentName) => {
    dispatch({ 
      type: GAME_ACTIONS.SET_PLAYER_INFO, 
      payload: { playerName, opponentName } 
    })
  }, [])

  const setRoomCode = useCallback((code) => {
    dispatch({ type: GAME_ACTIONS.SET_ROOM_CODE, payload: code })
  }, [])

  const setWaiting = useCallback((waiting) => {
    dispatch({ type: GAME_ACTIONS.SET_WAITING, payload: waiting })
  }, [])

  const makeMove = useCallback((col, player) => {
    const board = state.board
    console.log(`🎯 makeMove called: col=${col}, player=${player}`)
    console.log("🎯 Current board state:", board.map(row => row.map(cell => cell || ".")))
    
    // Find available row
    for (let row = 5; row >= 0; row--) {
      if (board[row][col] === null) {
        console.log(`🎯 Found available row ${row} in column ${col}`)
        
        // Create a temporary board with the piece placed to check for win
        const tempBoard = board.map(r => [...r])
        tempBoard[row][col] = player
        
        const winResult = checkWinner(tempBoard, row, col, player)
        const isDraw = !winResult.hasWinner && checkDraw(tempBoard)
        
        dispatch({
          type: GAME_ACTIONS.MAKE_MOVE,
          payload: {
            row,
            col,
            player,
            winResult: {
              ...winResult,
              isDraw
            }
          }
        })
        
        return { success: true, row, winResult, isDraw }
      }
    }
    
    return { success: false }
  }, [state.board])

  const setBoard = useCallback((board) => {
    dispatch({ type: GAME_ACTIONS.SET_BOARD, payload: board })
  }, [])

  const setCurrentPlayer = useCallback((player) => {
    dispatch({ type: GAME_ACTIONS.SET_CURRENT_PLAYER, payload: player })
  }, [])

  const setWinner = useCallback((winner) => {
    dispatch({ type: GAME_ACTIONS.SET_WINNER, payload: winner })
  }, [])

  const setWinningPieces = useCallback((pieces) => {
    dispatch({ type: GAME_ACTIONS.SET_WINNING_PIECES, payload: pieces })
  }, [])

  const selectCharacter = useCallback((character) => {
    dispatch({ type: GAME_ACTIONS.SELECT_CHARACTER, payload: character })
  }, [])

  const setArcadeStage = useCallback((stage) => {
    dispatch({ type: GAME_ACTIONS.SET_ARCADE_STAGE, payload: stage })
  }, [])

  const setCurrentAI = useCallback((ai) => {
    dispatch({ type: GAME_ACTIONS.SET_CURRENT_AI, payload: ai })
  }, [])

  const setPlayerTurn = useCallback((isPlayerTurn) => {
    dispatch({ type: GAME_ACTIONS.SET_PLAYER_TURN, payload: isPlayerTurn })
  }, [])

  const setTournamentManager = useCallback((manager) => {
    dispatch({ type: GAME_ACTIONS.SET_TOURNAMENT_MANAGER, payload: manager })
  }, [])

  const updateTimer = useCallback((turnDuration, turnStartTime) => {
    dispatch({ 
      type: GAME_ACTIONS.UPDATE_TIMER, 
      payload: { turnDuration, turnStartTime } 
    })
  }, [])

  const setPlayerStress = useCallback((stress) => {
    dispatch({ type: GAME_ACTIONS.SET_PLAYER_STRESS, payload: stress })
  }, [])

  const setOpponentStress = useCallback((stress) => {
    dispatch({ type: GAME_ACTIONS.SET_OPPONENT_STRESS, payload: stress })
  }, [])

  const setTurnStart = useCallback((time) => {
    dispatch({ type: GAME_ACTIONS.SET_TURN_START, payload: time })
  }, [])

  const setCumulativeTime = useCallback((player, opponent) => {
    dispatch({ 
      type: GAME_ACTIONS.SET_CUMULATIVE_TIME, 
      payload: { player, opponent } 
    })
  }, [])

  const setDefeatReason = useCallback((reason) => {
    dispatch({ type: GAME_ACTIONS.SET_DEFEAT_REASON, payload: reason })
  }, [])

  const resetBoard = useCallback(() => {
    dispatch({ type: GAME_ACTIONS.RESET_BOARD })
  }, [])

  const resetGame = useCallback(() => {
    dispatch({ type: GAME_ACTIONS.RESET_GAME })
  }, [])

  const toggleMute = useCallback(() => {
    dispatch({ type: GAME_ACTIONS.TOGGLE_MUTE })
  }, [])

  // Return state and actions
  return {
    // State
    ...state,
    
    // Actions
    setGameMode,
    setPlayerInfo,
    setRoomCode,
    setWaiting,
    makeMove,
    setBoard,
    setCurrentPlayer,
    setWinner,
    setWinningPieces,
    selectCharacter,
    setArcadeStage,
    setCurrentAI,
    setPlayerTurn,
    setTournamentManager,
    updateTimer,
    setPlayerStress,
    setOpponentStress,
    setTurnStart,
    setCumulativeTime,
    setDefeatReason,
    resetBoard,
    resetGame,
    toggleMute,
    
    // Helper functions
    checkWinner: (board, row, col, player) => checkWinner(board, row, col, player),
    checkDraw: (board) => checkDraw(board)
  }
}

export default useGameState