import React, { useState, useEffect } from 'react'
import './PlayerCard.css'

function PlayerCard({ 
  character, 
  characterName, 
  isActive, 
  isPlayer, 
  stressLevel, 
  turnDuration, 
  maxTurnTime = 30 
}) {
  const [stressEmoji, setStressEmoji] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)

  // Removed debug logging for performance

  // Determine stress emoji based on turn duration and stress level
  useEffect(() => {
    if (!isActive) {
      setShowEmoji(false)
      return
    }

    let emoji = ''
    let shouldShow = false

    // Time-based stress indicators
    const timePercentage = (turnDuration / maxTurnTime) * 100

    if (timePercentage > 70 || stressLevel > 70) {
      emoji = '💀' // Near death/panic
      shouldShow = true
    } else if (timePercentage > 40 || stressLevel > 40) {
      emoji = '😵' // Dizzy/stressed
      shouldShow = true
    } else if (timePercentage > 20 || stressLevel > 20) {
      emoji = '😰' // Worried/sweating
      shouldShow = true
    }

    setStressEmoji(emoji)
    setShowEmoji(shouldShow)
  }, [isActive, turnDuration, stressLevel, maxTurnTime])

  // Optimized stress level color calculation (memoized)
  const stressColor = React.useMemo(() => {
    if (stressLevel > 80) return '#ff0000' // Critical - red
    if (stressLevel > 60) return '#ff4500' // High - orange-red  
    if (stressLevel > 40) return '#ffa500' // Medium - orange
    if (stressLevel > 20) return '#ffff00' // Low - yellow
    return '#00ff00' // Minimal - green
  }, [stressLevel])

  // Optimized card urgency state calculation (memoized)
  const cardState = React.useMemo(() => {
    if (stressLevel > 90) return 'critical'
    if (stressLevel > 70) return 'danger'
    if (stressLevel > 40) return 'warning'
    return 'normal'
  }, [stressLevel])

  return (
    <div className={`player-card ${isActive ? 'active' : ''} ${cardState} ${isPlayer ? 'player' : 'opponent'}`}>
      {/* Stress Emoji */}
      {showEmoji && (
        <div className="stress-emoji">
          <span className="emoji-icon">{stressEmoji}</span>
        </div>
      )}

      {/* Character Portrait */}
      <div className="character-portrait-container">
        <img 
          src={character?.image || '/images/default-avatar.png'}
          alt={character?.name || characterName}
          className="character-portrait"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iI2ZmNDUwMCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIyMCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJGcmVkb2thLCBzYW5zLXNlcmlmIj7wn5SlPC90ZXh0Pjwvc3ZnPg=='
          }}
        />
        
        {/* Removed turn indicator - card glow is sufficient */}
      </div>

      {/* Character Info */}
      <div className="character-info">
        <h3 className="character-name">
          {character?.name || characterName}
        </h3>
        {character?.title && (
          <p className="character-title">{character.title}</p>
        )}
      </div>

      {/* Stress Meter */}
      <div className="stress-meter-container">
        <div className="stress-label">
          <span>Stress</span>
          <span className="stress-percentage">{Math.round(stressLevel)}%</span>
        </div>
        <div className="stress-meter">
          <div className="stress-meter-bg">
            <div 
              className="stress-meter-fill"
              style={{ 
                width: `${Math.min(stressLevel, 100)}%`,
                backgroundColor: stressColor
              }}
            ></div>
          </div>
          {/* Heart rate indicator */}
          {stressLevel > 0 && (
            <div className="heartbeat-indicator" style={{ 
              animationDuration: `${Math.max(0.3, 1.5 - (stressLevel / 100))}s` 
            }}>
              💓
            </div>
          )}
        </div>
      </div>

      {/* Critical Warning */}
      {stressLevel > 90 && (
        <div className="critical-warning">
          <span className="warning-text">CRITICAL!</span>
          <span className="warning-icon">⚠️</span>
        </div>
      )}

      {/* Timer runs behind the scenes - no visual display */}
    </div>
  )
}

export default PlayerCard