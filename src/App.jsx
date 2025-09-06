import React, { useState, useEffect } from "react";
import MainMenu from "./components/MainMenu";
import ArcadeMode from "./components/ArcadeMode";
import OnlineMode from "./components/OnlineMode";
import Board from "./components/Board";
import SoundManager from "./utils/SoundManager";
import "./styles/theme.css";
import "./styles/game.css";
import "./styles/animations.css";
import "./styles/buttons.css";
import "./styles/responsive.css";

// Game configuration constants
const GAME_CONFIG = {
  BOARD_ROWS: 6,
  BOARD_COLS: 7,
  WINNING_LENGTH: 4,
  PLAYER_COLORS: {
    PLAYER_ONE: "red",
    PLAYER_TWO: "yellow"
  },
  DEFAULT_NAMES: {
    PLAYER_ONE: "Player 1",
    PLAYER_TWO: "Player 2"
  },
  GAME_MODES: {
    ARCADE: "arcade",
    CREATE: "create",
    JOIN: "join",
    LOCAL: "local"
  }
};

// Helper to create empty board
const createEmptyBoard = () => 
  Array(GAME_CONFIG.BOARD_ROWS).fill(null).map(() => Array(GAME_CONFIG.BOARD_COLS).fill(null));

function App() {
  // High-level application state
  const [gameMode, setGameMode] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [roomCodeInput, setRoomCodeInput] = useState("");
  
  // Local multiplayer state (simple mode)
  const [localGameState, setLocalGameState] = useState({
    board: createEmptyBoard(),
    currentPlayer: GAME_CONFIG.PLAYER_COLORS.PLAYER_ONE,
    winner: null,
    isDraw: false,
    winningPieces: []
  });

  // Initialize sound manager on mount
  useEffect(() => {
    SoundManager.init();
    
    // Play background music when in game
    if (gameMode) {
      SoundManager.playBackgroundMusic();
    }
    
    return () => {
      SoundManager.stopBackgroundMusic();
    };
  }, [gameMode]);

  // Handle starting a new game from main menu
  const handleStartGame = (mode, name, code = null) => {
    setPlayerName(name);
    setRoomCodeInput(code || "");
    setGameMode(mode);
    
    // Reset local game state if switching to local mode
    if (mode === GAME_CONFIG.GAME_MODES.LOCAL) {
      setLocalGameState({
        board: createEmptyBoard(),
        currentPlayer: GAME_CONFIG.PLAYER_COLORS.PLAYER_ONE,
        winner: null,
        isDraw: false,
        winningPieces: []
      });
    }
  };

  // Handle returning to main menu
  const handleBackToMenu = () => {
    setGameMode(null);
    setPlayerName("");
    setRoomCodeInput("");
    SoundManager.stopBackgroundMusic();
  };

  // Check winner helper for local mode
  const checkWinner = (board, row, col, player) => {
    const checkDirection = (deltaRow, deltaCol) => {
      let count = 1;
      let positions = [{ row, col }];

      // Check forward direction
      for (let i = 1; i < GAME_CONFIG.WINNING_LENGTH; i++) {
        const newRow = row + deltaRow * i;
        const newCol = col + deltaCol * i;
        if (
          newRow >= 0 && newRow < GAME_CONFIG.BOARD_ROWS &&
          newCol >= 0 && newCol < GAME_CONFIG.BOARD_COLS &&
          board[newRow][newCol] === player
        ) {
          count++;
          positions.push({ row: newRow, col: newCol });
        } else {
          break;
        }
      }

      // Check backward direction
      for (let i = 1; i < GAME_CONFIG.WINNING_LENGTH; i++) {
        const newRow = row - deltaRow * i;
        const newCol = col - deltaCol * i;
        if (
          newRow >= 0 && newRow < GAME_CONFIG.BOARD_ROWS &&
          newCol >= 0 && newCol < GAME_CONFIG.BOARD_COLS &&
          board[newRow][newCol] === player
        ) {
          count++;
          positions.unshift({ row: newRow, col: newCol });
        } else {
          break;
        }
      }

      return count >= GAME_CONFIG.WINNING_LENGTH ? positions.slice(0, GAME_CONFIG.WINNING_LENGTH) : null;
    };

    const horizontal = checkDirection(0, 1);
    const vertical = checkDirection(1, 0);
    const diagonal1 = checkDirection(1, 1);
    const diagonal2 = checkDirection(1, -1);

    const winningLine = horizontal || vertical || diagonal1 || diagonal2;
    return winningLine
      ? { hasWinner: true, winningPieces: winningLine }
      : { hasWinner: false, winningPieces: [] };
  };

  // Check for draw in local mode
  const checkDraw = (board) => {
    return board[0].every((cell) => cell !== null);
  };

  // Handle disc drop for local mode
  const handleLocalDropDisc = (col) => {
    const { board, currentPlayer, winner, isDraw } = localGameState;
    
    if (winner || isDraw) return;
    
    const newBoard = board.map((row) => [...row]);
    
    for (let row = GAME_CONFIG.BOARD_ROWS - 1; row >= 0; row--) {
      if (newBoard[row][col] === null) {
        newBoard[row][col] = currentPlayer;
        
        SoundManager.playDropSound();
        
        const winResult = checkWinner(newBoard, row, col, currentPlayer);
        const hasWinner = winResult.hasWinner;
        const hasDraw = !hasWinner && checkDraw(newBoard);
        
        setLocalGameState({
          board: newBoard,
          currentPlayer: hasWinner || hasDraw ? currentPlayer : 
            (currentPlayer === GAME_CONFIG.PLAYER_COLORS.PLAYER_ONE ? 
              GAME_CONFIG.PLAYER_COLORS.PLAYER_TWO : 
              GAME_CONFIG.PLAYER_COLORS.PLAYER_ONE),
          winner: hasWinner ? currentPlayer : null,
          isDraw: hasDraw,
          winningPieces: hasWinner ? winResult.winningPieces : []
        });
        
        if (hasWinner) {
          SoundManager.playWinSound();
        }
        
        break;
      }
    }
  };

  // Render the appropriate component based on game mode
  if (!gameMode) {
    return <MainMenu onStartGame={handleStartGame} />;
  }

  if (gameMode === GAME_CONFIG.GAME_MODES.ARCADE) {
    return (
      <ArcadeMode 
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  if (gameMode === GAME_CONFIG.GAME_MODES.CREATE || gameMode === GAME_CONFIG.GAME_MODES.JOIN) {
    return (
      <OnlineMode
        mode={gameMode}
        playerName={playerName}
        roomCodeInput={roomCodeInput}
        onBackToMenu={handleBackToMenu}
      />
    );
  }

  if (gameMode === GAME_CONFIG.GAME_MODES.LOCAL) {
    // Simple local multiplayer mode
    const { board, currentPlayer, winner, isDraw, winningPieces } = localGameState;
    const [isMuted, setIsMuted] = useState(false);
    
    const toggleMute = () => {
      const muted = SoundManager.toggleMute();
      setIsMuted(muted);
    };
    
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

        <div className="players-info">
          <div className={`player-info ${currentPlayer === GAME_CONFIG.PLAYER_COLORS.PLAYER_ONE ? "active" : ""}`}>
            <span className="player-indicator red"></span>
            <span className="player-name">{playerName || GAME_CONFIG.DEFAULT_NAMES.PLAYER_ONE}</span>
          </div>
          <div className={`player-info ${currentPlayer === GAME_CONFIG.PLAYER_COLORS.PLAYER_TWO ? "active" : ""}`}>
            <span className="player-indicator yellow"></span>
            <span className="player-name">{GAME_CONFIG.DEFAULT_NAMES.PLAYER_TWO}</span>
          </div>
        </div>

        <div className="game-info">
          {winner ? (
            <div className="winner-message">
              <span className={`player-indicator ${winner}`}></span>
              {winner === GAME_CONFIG.PLAYER_COLORS.PLAYER_ONE ? 
                `${playerName || GAME_CONFIG.DEFAULT_NAMES.PLAYER_ONE} wins!` : 
                `${GAME_CONFIG.DEFAULT_NAMES.PLAYER_TWO} wins!`}
            </div>
          ) : isDraw ? (
            <div className="draw-message">It's a draw!</div>
          ) : (
            <div className="current-turn">
              {currentPlayer === GAME_CONFIG.PLAYER_COLORS.PLAYER_ONE ? 
                `${playerName || GAME_CONFIG.DEFAULT_NAMES.PLAYER_ONE}'s turn` : 
                `${GAME_CONFIG.DEFAULT_NAMES.PLAYER_TWO}'s turn`}
            </div>
          )}
        </div>

        <Board 
          board={board} 
          onColumnClick={handleLocalDropDisc} 
          winningPieces={winningPieces} 
        />

        <div className="game-controls">
          <button 
            className="reset-button" 
            onClick={() => {
              setLocalGameState({
                board: createEmptyBoard(),
                currentPlayer: GAME_CONFIG.PLAYER_COLORS.PLAYER_ONE,
                winner: null,
                isDraw: false,
                winningPieces: []
              });
            }}
          >
            Reset Game
          </button>
          <button className="reset-button" onClick={handleBackToMenu}>
            Back to Menu
          </button>
          <button className="mute-button" onClick={toggleMute}>
            {isMuted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
        </div>
      </div>
    );
  }

  // Fallback - shouldn't happen
  return (
    <div className="app">
      <div className="error-message">
        <h2>Unknown game mode: {gameMode}</h2>
        <button className="menu-button" onClick={handleBackToMenu}>
          Back to Menu
        </button>
      </div>
    </div>
  );
}

export default App;