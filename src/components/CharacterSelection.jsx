import React, { useState } from 'react'
import './CharacterSelection.css'

const CHARACTERS = [
  {
    id: 'southern',
    name: 'Southern',
    image: '/images/characters/southern.png',
    tags: ['Legendary', 'Mysterious', 'Master', 'Elite'],
    title: 'The Legend'
  },
  {
    id: 'tai',
    name: 'Tai',
    image: '/images/characters/tai.png',
    tags: ['Laid-back', 'Cool', 'Arlen', 'Chill'],
    title: 'The Chill Master'
  },
  {
    id: 'siole',
    name: 'Siole',
    image: '/images/characters/siole.png',
    tags: ['Competitive', 'Neighbor', 'Backyard', 'Fighter'],
    title: 'Backyard Champion'
  },
  {
    id: 'gianni',
    name: 'Gianni',
    image: '/images/characters/gianni.png',
    tags: ['Strategic', 'Business', 'Thinker', 'Deal'],
    title: 'The Dealmaker'
  },
  {
    id: 'jon',
    name: 'Jon',
    image: '/images/characters/jon.png',
    tags: ['Texan', 'Folksy', 'Wisdom', 'Friendly'],
    title: 'Country Strategist'
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

        {/* Character Full Preview */}
        <div className="character-full-preview">
          {selectedCharacter ? (
            <div className="full-character-display">
              <img 
                src={selectedCharacter.image} 
                alt={selectedCharacter.name}
                className="full-character-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2ZmNGYwMCIvPjx0ZXh0IHg9IjIwMCIgeT0iMjYwIiBmb250LXNpemU9IjMyIiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q2hhcmFjdGVyPC90ZXh0Pjwvc3ZnPg=='
                }}
              />
              <div className="character-info-overlay">
                <div className="character-name-tag">{selectedCharacter.name}</div>
                <h3 className="character-title">{selectedCharacter.title}</h3>
                <div className="character-tags">
                  {selectedCharacter.tags.map((tag, index) => (
                    <span key={index} className="character-tag">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="full-preview-placeholder">
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