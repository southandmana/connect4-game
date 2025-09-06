import React, { useState, useEffect } from 'react'
import './VSScreen.css'

function VSScreen({ playerCharacter, opponentName, opponentNumber, opponentDescription, onComplete }) {
  const [showContent, setShowContent] = useState(false)
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    // Show content with animation
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 300)

    // Start countdown after content appears
    const countdownTimer = setTimeout(() => {
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            setTimeout(() => {
              onComplete()
            }, 500)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, 1500)

    return () => {
      clearTimeout(timer)
      clearTimeout(countdownTimer)
    }
  }, [onComplete])

  const handleSkip = () => {
    onComplete()
  }

  const isFinalBoss = opponentNumber === 10

  return (
    <div className="vs-screen" onClick={handleSkip}>
      <div className={`vs-content ${showContent ? 'show' : ''}`}>
        {/* Background Effects */}
        <div className="vs-background">
          <div className="cyber-effect left"></div>
          <div className="cyber-effect right"></div>
          <div className="data-streams"></div>
        </div>

        {/* Main VS Layout */}
        <div className="vs-main">
          {/* Player Side */}
          <div className="character-side player-side">
            <div className="character-container">
              <img 
                src={playerCharacter.image} 
                alt={playerCharacter.name}
                className="character-image player-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxMDAiIGN5PSIxMDAiIHI9IjgwIiBmaWxsPSIjZmY0NTAwIi8+PHRleHQgeD0iMTAwIiB5PSIxMTAiIGZvbnQtc2l6ZT0iNDAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iRnJlZG9rYSwgc2Fucy1zZXJpZiI+8J+UpTwvdGV4dD48L3N2Zz4='
                }}
              />
              <div className="character-info">
                <h3 className="character-name player-name">{playerCharacter.name}</h3>
                <p className="character-title">🔥 CHALLENGER</p>
              </div>
            </div>
          </div>

          {/* VS Center */}
          <div className="vs-center">
            <div className="vs-logo">
              <span className="vs-text">VS</span>
              <div className="vs-effects">
                <div className="lightning bolt-1"></div>
                <div className="lightning bolt-2"></div>
              </div>
            </div>
            
            {countdown > 0 && (
              <div className="countdown">{countdown}</div>
            )}
          </div>

          {/* Opponent Side */}
          <div className="character-side opponent-side">
            <div className="character-container">
              <div className="opponent-image-container">
                {/* AI Opponent gets a generated avatar */}
                <div className={`ai-avatar ${isFinalBoss ? 'final-boss' : ''} difficulty-${Math.min(Math.ceil(opponentNumber / 2), 5)}`}>
                  {isFinalBoss ? '👑' : '🔥'}
                </div>
              </div>
              <div className="character-info">
                <h3 className="character-name opponent-name">{opponentName}</h3>
                <p className="character-title">
                  {isFinalBoss ? '👑 FINAL BOSS' : `⚔️ OPPONENT ${opponentNumber}`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Opponent Description */}
        <div className="opponent-description">
          <p>{opponentDescription}</p>
        </div>

        {/* Match Info */}
        <div className="match-info">
          <div className="match-label">
            {isFinalBoss ? 'FINAL BATTLE' : `TOURNAMENT MATCH ${opponentNumber}/10`}
          </div>
        </div>

        {/* Skip Button */}
        <button className="skip-button" onClick={handleSkip}>
          Skip ⏭️
        </button>
      </div>
    </div>
  )
}

export default VSScreen