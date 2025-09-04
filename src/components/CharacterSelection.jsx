import React, { useState } from 'react'
import './CharacterSelection.css'

const CHARACTERS = [
  {
    id: 'southern',
    name: 'Southern',
    image: '/images/southern.png',
    description: 'A fiery warrior from the depths of the underworld',
    title: 'The Flame Keeper'
  },
  {
    id: 'nova',
    name: 'Nova',
    image: '/images/nova.png',
    description: 'Lightning-fast strategist with explosive combos',
    title: 'Storm Caller'
  },
  {
    id: 'titan',
    name: 'Titan',
    image: '/images/titan.png',
    description: 'Immovable fortress with crushing defensive power',
    title: 'Iron Guardian'
  },
  {
    id: 'phantom',
    name: 'Phantom',
    image: '/images/phantom.png',
    description: 'Mysterious shadow master of deceptive tactics',
    title: 'Shadow Walker'
  },
  {
    id: 'blaze',
    name: 'Blaze',
    image: '/images/blaze.png',
    description: 'Aggressive fire-type with relentless offense',
    title: 'Inferno Beast'
  },
  {
    id: 'frost',
    name: 'Frost',
    image: '/images/frost.png',
    description: 'Cool-headed ice warrior with calculated precision',
    title: 'Frozen Soul'
  },
  {
    id: 'vortex',
    name: 'Vortex',
    image: '/images/vortex.png',
    description: 'Wind master who controls the battlefield flow',
    title: 'Tempest Lord'
  },
  {
    id: 'crimson',
    name: 'Crimson',
    image: '/images/crimson.png',
    description: 'Blood-red berserker with unstoppable rage',
    title: 'Crimson Fury'
  }
]

function CharacterSelection({ onCharacterSelect, onBack }) {
  const [selectedCharacter, setSelectedCharacter] = useState(null)

  const handleCharacterClick = (character) => {
    setSelectedCharacter(character)
  }

  const handleConfirmSelection = () => {
    if (selectedCharacter) {
      onCharacterSelect(selectedCharacter)
    }
  }

  return (
    <div className="character-selection">
      <div className="character-selection-header">
        <h1 className="selection-title">🔥 Choose Your Fighter 🔥</h1>
        <p className="selection-subtitle">Select your champion for the Connect 4 tournament!</p>
      </div>

      <div className="fighter-selection-layout">
        {/* Character Grid */}
        <div className="character-grid-container">
          <div className="character-grid">
            {CHARACTERS.map((character) => (
              <div
                key={character.id}
                className={`character-portrait ${selectedCharacter?.id === character.id ? 'selected' : ''}`}
                onClick={() => handleCharacterClick(character)}
              >
                <img 
                  src={character.image} 
                  alt={character.name}
                  className="portrait-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmNGYwMCIvPjx0ZXh0IHg9IjUwIiBgPSI1NSIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNoYXI8L3RleHQ+PC9zdmc+'
                  }}
                />
                {selectedCharacter?.id === character.id && (
                  <div className="selection-indicator">✓</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Character Preview */}
        <div className="character-preview">
          {selectedCharacter ? (
            <div className="preview-content">
              <div className="preview-image-container">
                <img 
                  src={selectedCharacter.image} 
                  alt={selectedCharacter.name}
                  className="preview-image"
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmNGYwMCIvPjx0ZXh0IHg9IjE1MCIgeT0iMTYwIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2hhcmFjdGVyPC90ZXh0Pjwvc3ZnPg=='
                  }}
                />
              </div>
              <div className="preview-details">
                <h2 className="preview-name">{selectedCharacter.name}</h2>
                <h3 className="preview-title">{selectedCharacter.title}</h3>
                <p className="preview-description">{selectedCharacter.description}</p>
                <div className="fighter-stats">
                  <div className="stat-bar">
                    <span className="stat-label">Power</span>
                    <div className="stat-fill" style={{width: '85%'}}></div>
                  </div>
                  <div className="stat-bar">
                    <span className="stat-label">Speed</span>
                    <div className="stat-fill" style={{width: '70%'}}></div>
                  </div>
                  <div className="stat-bar">
                    <span className="stat-label">Defense</span>
                    <div className="stat-fill" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="preview-placeholder">
              <div className="placeholder-icon">👤</div>
              <p>Select a fighter to preview</p>
            </div>
          )}
        </div>
      </div>

      <div className="selection-controls">
        <button 
          className="selection-button back-button" 
          onClick={onBack}
        >
          ← Back to Menu
        </button>
        
        <button 
          className={`selection-button confirm-button ${!selectedCharacter ? 'disabled' : ''}`}
          onClick={handleConfirmSelection}
          disabled={!selectedCharacter}
        >
          {selectedCharacter ? `Fight as ${selectedCharacter.name} →` : 'Select Fighter →'}
        </button>
      </div>
    </div>
  )
}

export default CharacterSelection