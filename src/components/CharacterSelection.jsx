import React, { useState } from 'react'
import './CharacterSelection.css'

const CHARACTERS = [
  {
    id: 'southern',
    name: 'Southern',
    image: '/images/southern.png',
    description: 'A fiery warrior from the depths of the underworld'
  }
  // More characters can be added here later
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
        <h1 className="selection-title">🔥 Choose Your Champion 🔥</h1>
        <p className="selection-subtitle">Select your character for the ultimate Connect 4 tournament!</p>
      </div>

      <div className="characters-grid">
        {CHARACTERS.map((character) => (
          <div
            key={character.id}
            className={`character-card ${selectedCharacter?.id === character.id ? 'selected' : ''}`}
            onClick={() => handleCharacterClick(character)}
          >
            <div className="character-image-container">
              <img 
                src={character.image} 
                alt={character.name}
                className="character-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZmNGYwMCIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkNoYXI8L3RleHQ+PC9zdmc+'
                }}
              />
              {selectedCharacter?.id === character.id && (
                <div className="selection-indicator">✓</div>
              )}
            </div>
            <h3 className="character-name">{character.name}</h3>
            <p className="character-description">{character.description}</p>
          </div>
        ))}
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
          Start Adventure →
        </button>
      </div>

      {selectedCharacter && (
        <div className="selected-character-preview">
          <p>Selected: <span className="selected-name">{selectedCharacter.name}</span></p>
        </div>
      )}
    </div>
  )
}

export default CharacterSelection