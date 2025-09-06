import React, { useState, useEffect, useCallback } from 'react'
import CharacterSelection from './CharacterSelection'
import Cinematic from './Cinematic'
import VSScreen from './VSScreen'
import GameContainer from './GameContainer'
import TournamentManager from '../utils/TournamentManager'
import AIOpponent from '../utils/AIOpponent'
import SoundManager from '../utils/SoundManager'
import './ArcadeMode/ArcadeMode.css'

function ArcadeMode({ onBackToMenu }) {
  // Tournament state
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [arcadeStage, setArcadeStage] = useState('characterSelect')
  const [tournamentManager, setTournamentManager] = useState(null)
  const [currentAI, setCurrentAI] = useState(null)
  const [defeatReason, setDefeatReason] = useState(null)
  
  // Score tracking
  const [totalScore, setTotalScore] = useState(0)
  const [matchScores, setMatchScores] = useState([])
  
  // References for game management
  const [gameContainerKey, setGameContainerKey] = useState(0)

  // Auto-progression for story intro
  useEffect(() => {
    if (arcadeStage === 'storyIntro') {
      const transitionTimer = setTimeout(() => {
        setArcadeStage('openingCinematic')
      }, 2700)
      return () => clearTimeout(transitionTimer)
    }
  }, [arcadeStage])

  // Auto-progression for battle transition
  useEffect(() => {
    if (arcadeStage === 'battleTransition') {
      const battleTimer = setTimeout(() => {
        handleBattleTransitionComplete()
      }, 2000)
      return () => clearTimeout(battleTimer)
    }
  }, [arcadeStage])

  // Auto-progression for victory moment
  useEffect(() => {
    if (arcadeStage === 'victoryMoment') {
      const victoryTimer = setTimeout(() => {
        handleVictoryMomentComplete()
      }, 3000)
      return () => clearTimeout(victoryTimer)
    }
  }, [arcadeStage])

  // Auto-progression for defeat moment
  useEffect(() => {
    if (arcadeStage === 'defeatMoment') {
      const defeatTimer = setTimeout(() => {
        handleDefeatMomentComplete()
      }, 3000)
      return () => clearTimeout(defeatTimer)
    }
  }, [arcadeStage])

  // Auto-progression for advancing transition
  useEffect(() => {
    if (arcadeStage === 'advancingTransition') {
      const advancingTimer = setTimeout(() => {
        handleAdvancingTransitionComplete()
      }, 2500)
      return () => clearTimeout(advancingTimer)
    }
  }, [arcadeStage])

  // Handle character selection
  const handleCharacterSelect = useCallback((character) => {
    setSelectedCharacter(character)
    setArcadeStage('storyIntro')
  }, [])

  // Handle opening cinematic completion
  const handleCinematicComplete = useCallback(() => {
    // Start tournament with VS screen
    const tournament = new TournamentManager()
    const firstAI = tournament.startTournament()
    setTournamentManager(tournament)
    setCurrentAI(firstAI)
    setArcadeStage('vsScreen')
  }, [])

  // Handle VS screen completion
  const handleVSScreenComplete = useCallback(() => {
    setArcadeStage('battleTransition')
  }, [])

  // Handle battle transition completion
  const handleBattleTransitionComplete = useCallback(() => {
    setArcadeStage('game')
    // Force GameContainer to reset by changing key
    setGameContainerKey(prev => prev + 1)
  }, [])

  // Handle game completion (win or loss)
  const handleGameComplete = useCallback((playerWon, reason = null) => {
    if (!tournamentManager) return

    // Store defeat reason if player lost
    if (!playerWon && reason) {
      setDefeatReason(reason)
    }

    // Calculate and store match score
    const matchScore = calculateMatchScore(playerWon, reason)
    setMatchScores(prev => [...prev, matchScore])
    setTotalScore(prev => prev + matchScore)

    // Update tournament progress
    const result = tournamentManager.handleMatchResult(playerWon)

    // Show victory or defeat moment
    if (playerWon) {
      setArcadeStage('victoryMoment')
    } else {
      setArcadeStage('defeatMoment')
    }
  }, [tournamentManager])

  // Calculate score for a match
  const calculateMatchScore = (won, defeatReason) => {
    let score = 0
    
    if (won) {
      // Base victory score
      score = 1000
      
      // Bonus for opponent difficulty
      if (tournamentManager) {
        const difficulty = tournamentManager.currentOpponent
        score += difficulty * 200 // Higher difficulty = more points
        
        // Perfect victory bonus (no stress timeout)
        if (defeatReason === null) {
          score += 500
        }
        
        // Final boss bonus
        if (difficulty === 10) {
          score += 2000
        }
      }
    } else {
      // Partial score for losing
      if (tournamentManager) {
        score = tournamentManager.currentOpponent * 50
      }
    }
    
    return score
  }

  // Handle victory moment completion
  const handleVictoryMomentComplete = useCallback(() => {
    if (!tournamentManager) return

    // Check if tournament is complete
    if (tournamentManager.isComplete && tournamentManager.isVictorious) {
      setTimeout(() => {
        setArcadeStage('endingCinematic')
      }, 800)
    } else {
      // Advance to next opponent
      const nextAI = tournamentManager.getCurrentOpponent()
      setCurrentAI(nextAI)
      setArcadeStage('advancingTransition')
    }
  }, [tournamentManager])

  // Handle defeat moment completion
  const handleDefeatMomentComplete = useCallback(() => {
    setArcadeStage('tournamentResults')
  }, [])

  // Handle advancing transition completion
  const handleAdvancingTransitionComplete = useCallback(() => {
    setArcadeStage('vsScreen')
  }, [])

  // Handle retry after defeat
  const handleRetry = useCallback(async () => {
    const progress = tournamentManager?.getProgress()
    const retryOpponent = progress?.currentOpponent || 1
    const retryWins = Math.max(0, (progress?.wins || 0))
    
    // Create new tournament at the retry point
    const tournament = new TournamentManager()
    tournament.currentOpponent = retryOpponent
    tournament.wins = retryWins
    tournament.losses = 0
    tournament.isComplete = false
    tournament.isVictorious = false
    tournament.tournamentStarted = true
    
    // Create AI opponent at retry difficulty
    const retryAI = new AIOpponent(retryOpponent, retryOpponent)
    tournament.currentAI = retryAI
    
    setTournamentManager(tournament)
    setCurrentAI(retryAI)
    setArcadeStage('vsScreen')
    setDefeatReason(null)
    setGameContainerKey(prev => prev + 1)
  }, [tournamentManager])

  // Render different arcade stages
  switch (arcadeStage) {
    case 'characterSelect':
      return (
        <CharacterSelection
          onCharacterSelect={handleCharacterSelect}
          onBack={onBackToMenu}
        />
      )

    case 'storyIntro':
      return (
        <div className="story-intro">
          <div className="visual-bubble">
            <div className="icon-decoration advance">📖</div>
            <div className="story-text">
              <h1>{selectedCharacter?.name}'s Story</h1>
            </div>
          </div>
        </div>
      )

    case 'openingCinematic':
      return (
        <Cinematic
          character={selectedCharacter}
          type="opening"
          onComplete={handleCinematicComplete}
        />
      )

    case 'vsScreen':
      return currentAI && tournamentManager ? (
        <VSScreen
          playerCharacter={selectedCharacter}
          opponentName={currentAI.name}
          opponentNumber={tournamentManager.currentOpponent}
          opponentDescription={tournamentManager.getOpponentDescription()}
          onComplete={handleVSScreenComplete}
        />
      ) : null

    case 'battleTransition':
      return (
        <div className="battle-transition">
          <div className="visual-diamond">
            <div className="diamond-content">
              <div className="icon-decoration battle">⚔️</div>
              <div className="battle-text">
                <h1>FIGHT!</h1>
                <div className="battle-subtitle">Let the battle begin!</div>
              </div>
            </div>
          </div>
        </div>
      )

    case 'victoryMoment':
      const latestScore = matchScores[matchScores.length - 1] || 0
      return (
        <div className="victory-moment">
          <div className="visual-circle">
            <div className="icon-decoration trophy">🏆</div>
            <div className="victory-text">
              <h1>VICTORY!</h1>
              <div className="victory-subtitle">
                {selectedCharacter?.name} emerges triumphant!
              </div>
              <div className="victory-description">
                Another opponent falls before your strategic might!
              </div>
              
              {/* Enhanced Score Display */}
              <div className="score-visual">
                <div className="score-icon">+</div>
                <div className="score-display">
                  {latestScore} points!
                </div>
                {latestScore > 1500 && (
                  <div className="score-multiplier">BONUS!</div>
                )}
              </div>
            </div>
          </div>
          
          {/* Tournament Progress Outside Circle */}
          <div className="tournament-progress">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <>
                <div 
                  key={level}
                  className={`progress-step ${
                    level <= (tournamentManager?.currentOpponent || 1) ? 'completed' : ''
                  }`}
                >
                  {level}
                </div>
                {level < 10 && (
                  <div 
                    className={`progress-connector ${level <= (tournamentManager?.currentOpponent || 1) ? 'completed' : ''}`}
                  />
                )}
              </>
            ))}
          </div>
        </div>
      )

    case 'defeatMoment':
      return (
        <div className="defeat-moment">
          <div className="visual-strip">
            <div className="icon-decoration battle">💀</div>
            <div className="defeat-text">
              <h1>DEFEAT</h1>
              <div className="defeat-subtitle">
                {currentAI?.name} has bested you!
              </div>
              <div className="defeat-description">
                {defeatReason === 'stress' 
                  ? 'Your stress overwhelmed you...'
                  : 'Even the strongest warriors must face defeat...'}
              </div>
            </div>
          </div>
          
          {/* Tournament Progress at Defeat */}
          <div className="tournament-progress">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <>
                <div 
                  key={level}
                  className={`progress-step ${
                    level < (tournamentManager?.currentOpponent || 1) ? 'completed' : 
                    level === (tournamentManager?.currentOpponent || 1) ? 'current' : ''
                  }`}
                >
                  {level}
                </div>
                {level < 10 && (
                  <div 
                    className={`progress-connector ${level < (tournamentManager?.currentOpponent || 1) ? 'completed' : ''}`}
                  />
                )}
              </>
            ))}
          </div>
        </div>
      )

    case 'advancingTransition':
      const nextOpponent = tournamentManager?.getCurrentOpponent()
      const currentLevel = tournamentManager?.currentOpponent || 1
      return (
        <div className="advancing-transition">
          <div className="visual-hexagon">
            <div className="advancing-text">
              <div className="icon-decoration advance">⚔️</div>
              <h1>ADVANCING</h1>
              <div className="advancing-subtitle">
                Preparing for the next challenger...
              </div>
              <div className="advancing-description">
                Next Opponent: <span className="opponent-name">{nextOpponent?.name}</span>
              </div>
            </div>
          </div>
          
          {/* Tournament Progress Indicator */}
          <div className="tournament-progress">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <>
                <div 
                  key={level}
                  className={`progress-step ${
                    level < currentLevel ? 'completed' : 
                    level === currentLevel ? 'current' : ''
                  }`}
                >
                  {level}
                </div>
                {level < 10 && (
                  <div 
                    className={`progress-connector ${level < currentLevel ? 'completed' : ''}`}
                  />
                )}
              </>
            ))}
          </div>
          
          {/* Visual Difficulty Indicator */}
          <div className="difficulty-visual">
            {Array.from({ length: 10 }, (_, i) => (
              <div 
                key={i}
                className={`difficulty-pip ${
                  i < currentLevel ? (currentLevel >= 8 ? 'critical' : 'filled') : ''
                }`}
              />
            ))}
          </div>
        </div>
      )

    case 'game':
      return currentAI ? (
        <GameContainer
          key={gameContainerKey}
          gameMode="arcade"
          onGameComplete={handleGameComplete}
          onBackToMenu={onBackToMenu}
          selectedCharacter={selectedCharacter}
          currentAI={currentAI}
          tournamentManager={tournamentManager}
        />
      ) : null

    case 'endingCinematic':
      const isVictorious = tournamentManager?.isVictorious || false
      return (
        <Cinematic
          character={selectedCharacter}
          type={isVictorious ? 'victory' : 'defeat'}
          onComplete={() => setArcadeStage('tournamentResults')}
        />
      )

    case 'tournamentResults':
      const progress = tournamentManager?.getProgress()
      const finalVictory = tournamentManager?.isVictorious || false
      
      return (
        <div className="app">
          <div className="tournament-results">
            <div className="visual-brackets">
              <div className={`icon-decoration ${finalVictory ? 'trophy' : 'battle'}`}>
                {finalVictory ? '🏆' : defeatReason === 'stress' ? '💀' : '😢'}
              </div>
              
              <h1 className="results-title">
                {finalVictory ? 'TOURNAMENT CHAMPION!' : 
                 defeatReason === 'stress' ? 'YOU DIED' : 'YOU LOST'}
              </h1>

              <div className="results-info">
                {finalVictory ? (
                  <p className="victory-message">
                    Congratulations! You defeated all {progress?.totalOpponents} opponents
                    and claimed the championship!
                  </p>
                ) : defeatReason === 'stress' ? (
                  <p className="defeat-message">
                    You defeated yourself. You had a heart attack.
                    <br />
                    You won {progress?.wins} match{progress?.wins !== 1 ? 'es' : ''} before dying.
                  </p>
                ) : (
                  <p className="defeat-message">
                    {currentAI?.name} defeated you. You suck.
                    <br />
                    You won {progress?.wins} match{progress?.wins !== 1 ? 'es' : ''} before falling.
                  </p>
                )}
              </div>

              <div className="score-section">
                <div className="score-visual">
                  <div className="score-icon">★</div>
                  <h2>Final Score: {totalScore}</h2>
                  {finalVictory && <div className="score-multiplier">CHAMPION!</div>}
                </div>
                
                <div className="score-breakdown">
                  <p>Matches Won: {progress?.wins || 0}</p>
                  <p>Highest Opponent: Level {progress?.currentOpponent || 1}</p>
                  {finalVictory && <p className="champion-bonus">🏆 Champion Bonus: +5000</p>}
                </div>
              </div>

              <div className="results-controls">
                <button className="menu-button" onClick={onBackToMenu}>
                  Return to Menu
                </button>
                {!finalVictory && (
                  <button className="retry-button menu-button" onClick={handleRetry}>
                    Try Again
                  </button>
                )}
              </div>
            </div>
            
            {/* Tournament Progress Visualization - Outside brackets */}
            <div className="tournament-progress">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <>
                  <div 
                    key={level}
                    className={`progress-step ${
                      level <= (progress?.wins || 0) ? 'completed' : 
                      level === (progress?.currentOpponent || 1) && !finalVictory ? 'current' : ''
                    }`}
                  >
                    {level}
                  </div>
                  {level < 10 && (
                    <div 
                      className={`progress-connector ${level <= (progress?.wins || 0) ? 'completed' : ''}`}
                    />
                  )}
                </>
              ))}
            </div>
          </div>
        </div>
      )

    default:
      // Fallback for any unhandled stages
      return (
        <div className="app">
          <div className="arcade-placeholder">
            <h1>🎮 Arcade Stage: {arcadeStage}</h1>
            <p>Selected Character: {selectedCharacter?.name}</p>
            <p>Current AI: {currentAI?.name}</p>
            <button className="reset-button" onClick={onBackToMenu}>
              Back to Menu
            </button>
          </div>
        </div>
      )
  }
}

export default ArcadeMode