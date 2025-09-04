import React, { useState, useEffect, useRef } from "react";
import Board from "./components/Board";
import MainMenu from "./components/MainMenu";
import CharacterSelection from "./components/CharacterSelection";
import Cinematic from "./components/Cinematic";
import VSScreen from "./components/VSScreen";
import PlayerCard from "./components/PlayerCard";
import OnlineGameManager from "./utils/OnlineGameManager";
import SoundManager from "./utils/SoundManager";
import TournamentManager from "./utils/TournamentManager";
import "./App.css";

function App() {
  const [gameMode, setGameMode] = useState(null);
  const [board, setBoard] = useState(
    Array(6)
      .fill(null)
      .map(() => Array(7).fill(null)),
  );
  const [currentPlayer, setCurrentPlayer] = useState("red");
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [opponentName, setOpponentName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Arcade mode specific state
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [arcadeStage, setArcadeStage] = useState("characterSelect"); // 'characterSelect', 'storyIntro', 'openingCinematic', 'vsScreen', 'game', 'endingCinematic', etc.
  const [tournamentManager, setTournamentManager] = useState(null);
  const [currentAI, setCurrentAI] = useState(null);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winningPieces, setWinningPieces] = useState([]);

  // Stress System State
  const [playerStress, setPlayerStress] = useState(0);
  const [opponentStress, setOpponentStress] = useState(0);
  const [turnStartTime, setTurnStartTime] = useState(Date.now());
  const [turnDuration, setTurnDuration] = useState(0);
  const [maxTurnTime, setMaxTurnTime] = useState(30); // 30 seconds max per turn
  const [gameStartTime, setGameStartTime] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [defeatReason, setDefeatReason] = useState(null); // 'stress', 'opponent', or null

  const onlineGameRef = useRef(null);
  const playerColorRef = useRef(null);
  const aiMoveTimeoutRef = useRef(null);
  const stressTimerRef = useRef(null);
  const turnTimerRef = useRef(null);

  useEffect(() => {
    SoundManager.init();
    if (gameMode) {
      SoundManager.playBackgroundMusic();
    }

    // Test Firebase connection
    import("./firebase").then(({ database }) => {
      import("firebase/database").then(({ ref, set }) => {
        const testRef = ref(database, "test");
        set(testRef, { message: "Firebase connected!", timestamp: Date.now() })
          .then(() => console.log("Firebase test write successful"))
          .catch((error) =>
            console.error("Firebase test write failed:", error),
          );
      });
    });

    // Only disconnect when component unmounts, not when gameMode changes
    return () => {
      SoundManager.stopBackgroundMusic();
    };
  }, [gameMode]);

  // Separate useEffect for cleanup on unmount only
  useEffect(() => {
    return () => {
      if (onlineGameRef.current) {
        onlineGameRef.current.disconnect();
      }
    };
  }, []);

  // Story intro auto-progression
  useEffect(() => {
    if (arcadeStage === "storyIntro") {
      const transitionTimer = setTimeout(() => {
        // Transition directly to cinematic - no fade out needed
        setArcadeStage("openingCinematic");
      }, 2700); // Small pause after text animation completes

      return () => clearTimeout(transitionTimer);
    }
  }, [arcadeStage]);

  // Battle transition auto-progression
  useEffect(() => {
    if (arcadeStage === "battleTransition") {
      const battleTimer = setTimeout(() => {
        handleBattleTransitionComplete();
      }, 2000); // 2 seconds for dramatic "FIGHT!" moment

      return () => clearTimeout(battleTimer);
    }
  }, [arcadeStage]);

  // Victory/Defeat moment auto-progression
  useEffect(() => {
    if (arcadeStage === "victoryMoment") {
      const victoryTimer = setTimeout(() => {
        handleVictoryMomentComplete();
      }, 3000); // 3 seconds to savor the victory

      return () => clearTimeout(victoryTimer);
    }
  }, [arcadeStage]);

  useEffect(() => {
    if (arcadeStage === "defeatMoment") {
      const defeatTimer = setTimeout(() => {
        handleDefeatMomentComplete();
      }, 3000); // 3 seconds to process the defeat

      return () => clearTimeout(defeatTimer);
    }
  }, [arcadeStage]);

  // Advancing transition auto-progression
  useEffect(() => {
    if (arcadeStage === "advancingTransition") {
      const advancingTimer = setTimeout(() => {
        handleAdvancingTransitionComplete();
      }, 2500); // 2.5 seconds for advancement message

      return () => clearTimeout(advancingTimer);
    }
  }, [arcadeStage]);

  // Stress System - Game State Management
  useEffect(() => {
    if (arcadeStage !== "game" || !currentAI || winner || isDraw) {
      // Clear timers when not in active game
      if (stressTimerRef.current) {
        clearInterval(stressTimerRef.current);
        stressTimerRef.current = null;
      }
      if (turnTimerRef.current) {
        clearInterval(turnTimerRef.current);
        turnTimerRef.current = null;
      }
      return;
    }
  }, [arcadeStage, currentAI, winner, isDraw]);

  // Highly Optimized Stress System - Starts immediately when match begins
  useEffect(() => {
    if (arcadeStage !== "game" || !currentAI || winner || isDraw) {
      return;
    }
    
    // Reset turn start time when game starts or turn changes
    const turnStart = Date.now();
    setTurnStartTime(turnStart);
    setTurnDuration(0);

    // Clear existing timers
    if (stressTimerRef.current) clearInterval(stressTimerRef.current);
    if (turnTimerRef.current) clearInterval(turnTimerRef.current);

    // Ultra-efficient timer - runs every 3 seconds for minimal CPU usage
    stressTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - turnStart) / 1000;
      const turnStress = Math.min(100, (elapsed / maxTurnTime) * 100);
      
      // Update duration for visual timer
      setTurnDuration(elapsed);

      if (isPlayerTurn) {
        setPlayerStress(turnStress);
        setOpponentStress(prev => Math.max(0, prev - 2)); // Faster decrease
      } else {
        setOpponentStress(turnStress);
        setPlayerStress(prev => Math.max(0, prev - 2)); // Faster decrease
      }

      // Check for timeout/stress death
      if (elapsed >= maxTurnTime) {
        if (isPlayerTurn) {
          setWinner("yellow");
          // Shorter delay for timeout wins (no Connect 4 animation to show)
          setTimeout(() => {
            handleGameComplete(false, 'stress');
          }, 1500);
        } else {
          setWinner("red");
          // Shorter delay for timeout wins (no Connect 4 animation to show)
          setTimeout(() => {
            handleGameComplete(true);
          }, 1500);
        }
        return;
      }
    }, 3000); // Update every 3 seconds - ultra-efficient!

    return () => {
      if (stressTimerRef.current) {
        clearInterval(stressTimerRef.current);
        stressTimerRef.current = null;
      }
    };
  }, [isPlayerTurn, arcadeStage, currentAI]); // Depend on turn changes AND game start

  // Reset stress when starting new game
  useEffect(() => {
    if (arcadeStage === "game") {
      setPlayerStress(0);
      setOpponentStress(0);
      setTurnDuration(0);
      setTurnStartTime(Date.now());
      setGameStartTime(Date.now());
    }
  }, [arcadeStage]);

  const checkWinner = (board, row, col, player) => {
    const checkDirection = (deltaRow, deltaCol) => {
      let count = 1;
      let positions = [{ row, col }];

      // Check forward direction
      for (let i = 1; i < 4; i++) {
        const newRow = row + deltaRow * i;
        const newCol = col + deltaCol * i;
        if (
          newRow >= 0 &&
          newRow < 6 &&
          newCol >= 0 &&
          newCol < 7 &&
          board[newRow][newCol] === player
        ) {
          count++;
          positions.push({ row: newRow, col: newCol });
        } else {
          break;
        }
      }

      // Check backward direction
      for (let i = 1; i < 4; i++) {
        const newRow = row - deltaRow * i;
        const newCol = col - deltaCol * i;
        if (
          newRow >= 0 &&
          newRow < 6 &&
          newCol >= 0 &&
          newCol < 7 &&
          board[newRow][newCol] === player
        ) {
          count++;
          positions.unshift({ row: newRow, col: newCol });
        } else {
          break;
        }
      }

      return count >= 4 ? positions.slice(0, 4) : null;
    };

    // Check all directions
    const horizontal = checkDirection(0, 1);
    const vertical = checkDirection(1, 0);
    const diagonal1 = checkDirection(1, 1);
    const diagonal2 = checkDirection(1, -1);

    const winningLine = horizontal || vertical || diagonal1 || diagonal2;
    return winningLine
      ? { hasWinner: true, winningPieces: winningLine }
      : { hasWinner: false, winningPieces: [] };
  };

  const checkDraw = (board) => {
    return board[0].every((cell) => cell !== null);
  };

  const handleOnlineGameUpdate = (gameData) => {
    if (gameData.host && gameData.guest) {
      setIsWaiting(false);
      setOpponentName(
        playerColorRef.current === "red"
          ? gameData.guest.name
          : gameData.host.name,
      );
    } else {
      setIsWaiting(true);
    }

    // Convert board string from Firebase back to array
    let boardData = Array(6)
      .fill(null)
      .map(() => Array(7).fill(null));
    if (gameData.boardString) {
      console.log(
        "Converting board string from Firebase:",
        gameData.boardString,
      );
      const rows = gameData.boardString.split(";");
      boardData = rows.map((rowString) =>
        rowString
          .split(",")
          .map((cell) => (cell === "null" || cell === "" ? null : cell)),
      );
      console.log("Converted board data:", boardData);
    } else if (gameData.board && Array.isArray(gameData.board)) {
      // Fallback to old board format if it exists and is an array
      boardData = gameData.board;
    }

    console.log("Setting board to:", boardData);
    setBoard(boardData);
    setCurrentPlayer(gameData.currentPlayer || "red");
    setWinner(gameData.winner);
    setIsDraw(gameData.isDraw || false);

    if (gameData.winner && gameData.winner !== winner) {
      SoundManager.playWinSound();
    }
  };

  const handleCharacterSelect = (character) => {
    setSelectedCharacter(character);
    setPlayerName(character.name);
    setArcadeStage("storyIntro");
  };

  const handleCinematicComplete = () => {
    // After opening cinematic, start tournament with VS screen
    const tournament = new TournamentManager();
    const firstAI = tournament.startTournament();
    setTournamentManager(tournament);
    setCurrentAI(firstAI);
    setArcadeStage("vsScreen");
  };

  const handleVSScreenComplete = () => {
    // After VS screen, show battle transition first
    setArcadeStage("battleTransition");
  };

  const handleBattleTransitionComplete = () => {
    // After battle transition, start the actual game
    setArcadeStage("game");
    setBoard(
      Array(6)
        .fill(null)
        .map(() => Array(7).fill(null)),
    );
    setCurrentPlayer("red"); // Player always goes first
    setWinner(null);
    setIsDraw(false);
    setWinningPieces([]); // Clear any winning animation
    setDefeatReason(null); // Clear defeat reason for new game
    setIsPlayerTurn(true);
  };

  const handleGameComplete = (playerWon, reason = null) => {
    if (!tournamentManager) return;

    // Clear any pending AI moves
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = null;
    }

    // Store the defeat reason for tournament results
    if (!playerWon && reason) {
      setDefeatReason(reason);
    }

    // Store the tournament result for later use
    const result = tournamentManager.handleMatchResult(playerWon);

    // First show victory or defeat moment
    if (playerWon) {
      setArcadeStage("victoryMoment");
    } else {
      setArcadeStage("defeatMoment");
    }
  };

  const handleVictoryMomentComplete = () => {
    if (!tournamentManager) return;

    // Check if tournament is complete after victory
    console.log("Checking tournament completion:", {
      isComplete: tournamentManager.isComplete,
      isVictorious: tournamentManager.isVictorious,
      currentOpponent: tournamentManager.currentOpponent
    });
    if (tournamentManager.isComplete && tournamentManager.isVictorious) {
      // Add delay for dramatic effect and prevent click bubbling
      setTimeout(() => {
        setArcadeStage("endingCinematic");
      }, 800);
    } else {
      // Advance to next opponent
      const nextAI = tournamentManager.getCurrentOpponent();
      setCurrentAI(nextAI);
      setArcadeStage("advancingTransition");
    }
  };

  const handleDefeatMomentComplete = () => {
    if (!tournamentManager) return;

    // Show tournament results after defeat
    setArcadeStage("tournamentResults");
  };

  const handleAdvancingTransitionComplete = () => {
    // After advancing transition, show next VS screen
    setArcadeStage("vsScreen");
  };

  const handleBackToMenu = () => {
    // Clear AI timeout if running
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = null;
    }

    setGameMode(null);
    setArcadeStage("characterSelect");
    setSelectedCharacter(null);
    setTournamentManager(null);
    setCurrentAI(null);
    setIsPlayerTurn(true);
  };

  const handleStartGame = async (mode, name, code = null) => {
    // Handle arcade mode separately (doesn't need online setup)
    if (mode === "arcade") {
      setGameMode(mode);
      setArcadeStage("characterSelect");
      return;
    }

    setPlayerName(name);
    setGameMode(mode);

    if (mode === "create") {
      onlineGameRef.current = new OnlineGameManager();
      try {
        const roomId = await onlineGameRef.current.createRoom(
          name,
          handleOnlineGameUpdate,
          (error) => console.error("Game error:", error),
        );
        console.log("Room created with ID:", roomId);
        setRoomCode(roomId);
        playerColorRef.current = "red";
        setIsWaiting(true);
        console.log("Room code state set to:", roomId);
      } catch (error) {
        console.error("Failed to create room:", error);
        if (
          confirm(
            "Failed to create room. Please check your internet connection.\n\nWould you like to return to the main menu?",
          )
        ) {
          setGameMode(null);
        }
        // If user cancels, they stay in the current state to retry
      }
    } else if (mode === "join") {
      onlineGameRef.current = new OnlineGameManager();
      try {
        await onlineGameRef.current.joinRoom(
          code,
          name,
          handleOnlineGameUpdate,
          (error) => {
            console.error("Game error:", error);
            if (
              confirm(
                "Room not found! Please check the room code.\n\nWould you like to return to the main menu?",
              )
            ) {
              setGameMode(null);
            }
            // If user cancels, they stay to retry with a different code
          },
        );
        setRoomCode(code);
        playerColorRef.current = "yellow";
      } catch (error) {
        console.error("Failed to join room:", error);
        if (
          confirm(
            "Failed to join room. Please check the room code.\n\nWould you like to return to the main menu?",
          )
        ) {
          setGameMode(null);
        }
        // If user cancels, they stay in the current state to retry
      }
    } else if (mode === "local") {
      setOpponentName("Player 2");
    }
  };

  const makeAIMove = (currentBoard) => {
    if (!currentAI || winner || isDraw) return;

    const aiCol = currentAI.getMove(currentBoard);
    if (aiCol === -1) return; // No valid moves

    const newBoard = currentBoard.map((row) => [...row]);

    for (let row = 5; row >= 0; row--) {
      if (newBoard[row][aiCol] === null) {
        newBoard[row][aiCol] = "yellow"; // AI is always yellow
        setBoard(newBoard);

        SoundManager.playDropSound();

        const aiWinResult = checkWinner(newBoard, row, aiCol, "yellow");
        if (aiWinResult.hasWinner) {
          setWinner("yellow");
          setWinningPieces(aiWinResult.winningPieces);
          SoundManager.playWinSound();
          // Show epic winning animation for 3.5 seconds before transitioning
          setTimeout(() => {
            handleGameComplete(false, 'opponent'); // AI won (player lost)
          }, 3500);
        } else if (checkDraw(newBoard)) {
          setIsDraw(true);
          handleGameComplete(false, 'opponent'); // Draw (counts as loss in tournament)
        } else {
          // Switch back to player turn
          setCurrentPlayer("red");
          setIsPlayerTurn(true);
          setTurnStartTime(Date.now()); // Reset turn timer
        }
        break;
      }
    }
  };

  const dropDisc = async (col) => {
    if (winner || isDraw) return;

    if (gameMode === "create" || gameMode === "join") {
      if (isWaiting) {
        alert("Waiting for opponent to join!");
        return;
      }

      console.log(
        "Online mode click - currentPlayer:",
        currentPlayer,
        "playerColor:",
        playerColorRef.current,
      );
      if (currentPlayer !== playerColorRef.current) {
        console.log(
          "It's not your turn! Current turn:",
          currentPlayer,
          "Your color:",
          playerColorRef.current,
        );
        return;
      }
      console.log("It's your turn, proceeding with move");

      for (let row = 5; row >= 0; row--) {
        if (board[row][col] === null) {
          const newBoard = board.map((row) => [...row]);
          newBoard[row][col] = currentPlayer;

          SoundManager.playDropSound();

          const winResult = checkWinner(newBoard, row, col, currentPlayer);
          const hasWinner = winResult.hasWinner;
          const hasDraw = !hasWinner && checkDraw(newBoard);

          console.log("Updating game state with new board...");
          const updateData = {
            board: newBoard,
            currentPlayer: currentPlayer === "red" ? "yellow" : "red",
            winner: hasWinner ? currentPlayer : null,
            winningPieces: hasWinner ? winResult.winningPieces : [],
            isDraw: hasDraw,
            lastMove: { row, col, player: currentPlayer },
          };
          console.log("Update data:", updateData);

          try {
            // Convert board to string format for Firebase (Firebase doesn't handle nested arrays well)
            const boardString = updateData.board
              .map((row) => row.join(","))
              .join(";");
            const firebaseData = {
              ...updateData,
              boardString: boardString,
            };
            console.log("Sending board string to Firebase:", boardString);
            await onlineGameRef.current.updateGameState(firebaseData);
            console.log("✅ Game state updated successfully");
          } catch (error) {
            console.error("❌ Failed to update game state:", error);
          }

          if (hasWinner) {
            SoundManager.playWinSound();
          }
          break;
        }
      }
    } else if (gameMode === "arcade") {
      // Arcade mode with AI opponent
      if (!isPlayerTurn || currentPlayer !== "red") return;

      const newBoard = board.map((row) => [...row]);

      for (let row = 5; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          newBoard[row][col] = "red"; // Player is always red
          setBoard(newBoard);

          SoundManager.playDropSound();

          const winResult = checkWinner(newBoard, row, col, "red");
          if (winResult.hasWinner) {
            setWinner("red");
            setWinningPieces(winResult.winningPieces);
            SoundManager.playWinSound();
            // Show epic winning animation for 3.5 seconds before transitioning
            setTimeout(() => {
              handleGameComplete(true); // Player won
            }, 3500);
          } else if (checkDraw(newBoard)) {
            setIsDraw(true);
            handleGameComplete(false, 'opponent'); // Draw (counts as loss in tournament)
          } else {
            // Switch to AI turn
            setCurrentPlayer("yellow");
            setIsPlayerTurn(false);
            setTurnStartTime(Date.now()); // Reset turn timer for AI

            // AI makes move after delay
            aiMoveTimeoutRef.current = setTimeout(() => {
              makeAIMove(newBoard);
            }, 1000); // 1 second delay for dramatic effect
          }
          break;
        }
      }
    } else {
      // Local play mode (fallback)
      const newBoard = board.map((row) => [...row]);

      for (let row = 5; row >= 0; row--) {
        if (newBoard[row][col] === null) {
          newBoard[row][col] = currentPlayer;
          setBoard(newBoard);

          SoundManager.playDropSound();

          const localWinResult = checkWinner(newBoard, row, col, currentPlayer);
          if (localWinResult.hasWinner) {
            setWinner(currentPlayer);
            setWinningPieces(localWinResult.winningPieces);
            SoundManager.playWinSound();
          } else if (checkDraw(newBoard)) {
            setIsDraw(true);
          } else {
            setCurrentPlayer(currentPlayer === "red" ? "yellow" : "red");
          }
          break;
        }
      }
    }
  };

  const resetGame = () => {
    if (onlineGameRef.current) {
      onlineGameRef.current.disconnect();
      onlineGameRef.current = null;
    }

    setBoard(
      Array(6)
        .fill(null)
        .map(() => Array(7).fill(null)),
    );
    setCurrentPlayer("red");
    setWinner(null);
    setIsDraw(false);
    setWinningPieces([]); // Clear winning animation
    setDefeatReason(null); // Clear defeat reason
    setGameMode(null);
    setRoomCode("");
    setIsWaiting(false);
    setOpponentName("");
    playerColorRef.current = null;

    // Reset arcade mode state
    setSelectedCharacter(null);
    setArcadeStage("characterSelect");
    setTournamentManager(null);
    setCurrentAI(null);
    setIsPlayerTurn(true);

    // Clear AI timeout if running
    if (aiMoveTimeoutRef.current) {
      clearTimeout(aiMoveTimeoutRef.current);
      aiMoveTimeoutRef.current = null;
    }
  };

  const toggleMute = () => {
    const muted = SoundManager.toggleMute();
    setIsMuted(muted);
  };

  if (!gameMode) {
    return <MainMenu onStartGame={handleStartGame} />;
  }

  // Arcade mode system
  if (gameMode === "arcade") {
    if (arcadeStage === "characterSelect") {
      return (
        <CharacterSelection
          onCharacterSelect={handleCharacterSelect}
          onBack={handleBackToMenu}
        />
      );
    }

    if (arcadeStage === "storyIntro") {
      return (
        <div className="story-intro">
          <div className="story-text">
            <h1>{selectedCharacter?.name}'s Story</h1>
          </div>
        </div>
      );
    }

    if (arcadeStage === "openingCinematic") {
      return (
        <Cinematic
          character={selectedCharacter}
          type="opening"
          onComplete={handleCinematicComplete}
        />
      );
    }

    if (arcadeStage === "vsScreen" && currentAI && tournamentManager) {
      return (
        <VSScreen
          playerCharacter={selectedCharacter}
          opponentName={currentAI.name}
          opponentNumber={tournamentManager?.currentOpponent || 1}
          opponentDescription={tournamentManager?.getOpponentDescription() || "A mysterious opponent awaits..."}
          onComplete={handleVSScreenComplete}
        />
      );
    }

    if (arcadeStage === "battleTransition") {
      return (
        <div className="battle-transition">
          <div className="battle-text">
            <h1>FIGHT!</h1>
            <div className="battle-subtitle">Let the battle begin!</div>
          </div>
        </div>
      );
    }

    if (arcadeStage === "victoryMoment") {
      return (
        <div className="victory-moment">
          <div className="victory-text">
            <h1>VICTORY!</h1>
            <div className="victory-subtitle">
              🏆 {selectedCharacter?.name} emerges triumphant!
            </div>
            <div className="victory-description">
              Another opponent falls before your strategic might!
            </div>
          </div>
        </div>
      );
    }

    if (arcadeStage === "defeatMoment") {
      return (
        <div className="defeat-moment">
          <div className="defeat-text">
            <h1>DEFEAT</h1>
            <div className="defeat-subtitle">
              💀 {currentAI?.name} has bested you!
            </div>
            <div className="defeat-description">
              Even the strongest warriors must face defeat...
            </div>
          </div>
        </div>
      );
    }

    if (arcadeStage === "advancingTransition") {
      const nextOpponent = tournamentManager?.getCurrentOpponent();
      return (
        <div className="advancing-transition">
          <div className="advancing-text">
            <h1>ADVANCING</h1>
            <div className="advancing-subtitle">
              ⚔️ Preparing for the next challenger...
            </div>
            <div className="advancing-description">
              Next Opponent:{" "}
              <span className="opponent-name">{nextOpponent?.name}</span>
            </div>
          </div>
        </div>
      );
    }

    if (arcadeStage === "game" && currentAI) {
      // Arcade tournament gameplay
      const progress = tournamentManager?.getProgress();
      const difficultyInfo = tournamentManager?.getDifficultyInfo();

      return (
        <div className="app">
          {/* Tournament Info Header */}
          <div className="tournament-header">
            <div className="tournament-progress">
              <h3>🏆 Tournament Progress: {progress?.currentOpponent}/10</h3>
              <p>
                Opponent: {currentAI.name} ({difficultyInfo?.name})
              </p>
              {difficultyInfo?.isFinalBoss && (
                <p className="final-boss-indicator">👑 FINAL BOSS!</p>
              )}
            </div>
          </div>

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
                character={null} // AI doesn't have character data like player
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
            <button className="reset-button" onClick={resetGame}>
              Quit Tournament
            </button>
            <button className="mute-button" onClick={toggleMute}>
              {isMuted ? "🔇 Unmute" : "🔊 Mute"}
            </button>
            {/* TEST BUTTONS - For debugging */}
            <button 
              style={{backgroundColor: 'green', color: 'white'}}
              onClick={() => {
                setWinner("red");
                handleGameComplete(true);
              }}
            >
              🏆 TEST: Win Now
            </button>
            <button 
              style={{backgroundColor: 'red', color: 'white'}}
              onClick={() => {
                setWinner("yellow");
                handleGameComplete(false);
              }}
            >
              💀 TEST: Lose Now
            </button>
            <button 
              style={{backgroundColor: 'purple', color: 'white'}}
              onClick={async () => {
                // Skip directly to opponent 9
                if (tournamentManager) {
                  tournamentManager.currentOpponent = 9;
                  tournamentManager.wins = 8; // Simulate 8 wins
                  const AIOpponentModule = await import('./utils/AIOpponent.js');
                  const opponent9 = new AIOpponentModule.default(9, 9);
                  setCurrentAI(opponent9);
                  // Reset board for new match
                  setBoard(
                    Array(6)
                      .fill(null)
                      .map(() => Array(7).fill(null))
                  );
                  setWinner(null);
                  setIsDraw(false);
                  setWinningPieces([]); // Clear winning animation
                  setIsPlayerTurn(true);
                  setCurrentPlayer("red");
                  console.log("TEST: Skipped to opponent 9 - Soul Reaper");
                }
              }}
            >
              ⚡ TEST: Skip to Match 9
            </button>
            <button 
              style={{backgroundColor: 'gold', color: 'black'}}
              onClick={async () => {
                // Skip directly to opponent 10 (final boss)
                if (tournamentManager) {
                  tournamentManager.currentOpponent = 10;
                  tournamentManager.wins = 9; // Simulate 9 wins
                  const AIOpponentModule = await import('./utils/AIOpponent.js');
                  const opponent10 = new AIOpponentModule.default(10, 10);
                  setCurrentAI(opponent10);
                  // Reset board for new match
                  setBoard(
                    Array(6)
                      .fill(null)
                      .map(() => Array(7).fill(null))
                  );
                  setWinner(null);
                  setIsDraw(false);
                  setWinningPieces([]); // Clear winning animation
                  setIsPlayerTurn(true);
                  setCurrentPlayer("red");
                  console.log("TEST: Skipped to opponent 10 - THE FINAL BOSS!");
                }
              }}
            >
              👑 TEST: Skip to Final Boss
            </button>
          </div>
        </div>
      );
    }

    if (arcadeStage === "endingCinematic") {
      console.log("🎬 Rendering ending cinematic, tournament state:", {
        isVictorious: tournamentManager?.isVictorious,
        character: selectedCharacter,
        characterId: selectedCharacter?.id,
        characterName: selectedCharacter?.name
      });
      const isVictorious = tournamentManager?.isVictorious || false;

      return (
        <Cinematic
          character={selectedCharacter}
          type={isVictorious ? "victory" : "defeat"}
          onComplete={() => {
            console.log("Cinematic complete, showing tournament results");
            // Show results screen instead of immediately going to menu
            setArcadeStage("tournamentResults");
          }}
        />
      );
    }

    if (arcadeStage === "tournamentResults") {
      const progress = tournamentManager?.getProgress();
      const isVictorious = tournamentManager?.isVictorious || false;

      return (
        <div className="app">
          <div className="tournament-results">
            <h1 className="results-title">
              {isVictorious ? "🏆 TOURNAMENT CHAMPION!" : 
               defeatReason === 'stress' ? "💀 YOU DIED" : "😢 YOU LOST"}
            </h1>

            <div className="results-info">
              {isVictorious ? (
                <p className="victory-message">
                  Congratulations! You defeated all {progress?.totalOpponents}{" "}
                  opponents and claimed the championship!
                </p>
              ) : defeatReason === 'stress' ? (
                <p className="defeat-message">
                  You defeated yourself. You had a heart attack.
                  <br />
                  You won {progress?.wins} match
                  {progress?.wins !== 1 ? "es" : ""} before dying.
                </p>
              ) : (
                <p className="defeat-message">
                  {currentAI?.name} defeated you. You suck.
                  <br />
                  You won {progress?.wins} match
                  {progress?.wins !== 1 ? "es" : ""} before falling.
                </p>
              )}
            </div>

            <div className="results-controls">
              <button className="menu-button" onClick={resetGame}>
                Return to Menu
              </button>
              {!isVictorious && (
                <button
                  className="retry-button menu-button"
                  onClick={async () => {
                    // Retry the same opponent you lost to
                    const retryOpponent = progress?.currentOpponent || 1;
                    const retryWins = Math.max(0, (progress?.wins || 0));
                    
                    const tournament = new TournamentManager();
                    tournament.currentOpponent = retryOpponent;
                    tournament.wins = retryWins;
                    tournament.losses = 0;
                    tournament.isComplete = false;
                    tournament.isVictorious = false;
                    tournament.tournamentStarted = true;
                    
                    const AIOpponentModule = await import('./utils/AIOpponent.js');
                    const retryAI = new AIOpponentModule.default(retryOpponent, retryOpponent);
                    tournament.currentAI = retryAI;
                    
                    setTournamentManager(tournament);
                    setCurrentAI(retryAI);
                    setArcadeStage("vsScreen");
                    setBoard(
                      Array(6)
                        .fill(null)
                        .map(() => Array(7).fill(null)),
                    );
                    setCurrentPlayer("red");
                    setWinner(null);
                    setIsDraw(false);
                    setWinningPieces([]); // Clear winning animation
                    setIsPlayerTurn(true);
                  }}
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      );
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
    );
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
                  navigator.clipboard.writeText(roomCode);
                  alert(`Room code ${roomCode} copied to clipboard!`);
                }}
              >
                📋 Copy
              </button>
            </div>
            {isWaiting && (
              <div className="waiting">Waiting for opponent to join...</div>
            )}
          </div>
        )}
      </div>

      <div className="players-info">
        <div
          className={`player-info ${currentPlayer === "red" ? "active" : ""}`}
        >
          <span className="player-indicator red"></span>
          <span className="player-name">
            {playerColorRef.current === "red"
              ? playerName
              : gameMode === "local"
                ? playerName
                : opponentName}
          </span>
        </div>
        <div
          className={`player-info ${currentPlayer === "yellow" ? "active" : ""}`}
        >
          <span className="player-indicator yellow"></span>
          <span className="player-name">
            {playerColorRef.current === "yellow" ? playerName : opponentName}
          </span>
        </div>
      </div>

      <div className="game-info">
        {winner ? (
          <div className="winner-message">
            <span className={`player-indicator ${winner}`}></span>
            {winner === playerColorRef.current
              ? "You win!"
              : gameMode === "local"
                ? `${winner === "red" ? playerName : opponentName} wins!`
                : `${opponentName} wins!`}
          </div>
        ) : isDraw ? (
          <div className="draw-message">It's a draw!</div>
        ) : (
          <div className="current-turn">
            {gameMode === "create" || gameMode === "join"
              ? currentPlayer === playerColorRef.current
                ? "Your turn"
                : `${opponentName}'s turn`
              : currentPlayer === "red"
                ? `${playerName}'s turn`
                : `${opponentName}'s turn`}
          </div>
        )}
      </div>

      <Board board={board} onColumnClick={dropDisc} winningPieces={winningPieces} />

      <div className="game-controls">
        <button className="reset-button" onClick={resetGame}>
          Back to Menu
        </button>
        <button className="mute-button" onClick={toggleMute}>
          {isMuted ? "🔇 Unmute" : "🔊 Mute"}
        </button>
      </div>
    </div>
  );
}

export default App;
