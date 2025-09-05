import React, { useState } from 'react'
import './MainMenu.css'

/**
 * Main menu UI for selecting a game mode and initiating a game.
 *
 * Renders controls to start Arcade, create an online room, or join an existing room.
 * Player name input is used when available; defaults to "Player 1" for arcade/create and "Player 2" for join.
 * Room codes are converted to uppercase and trimmed before being passed to the start callback; joining is only attempted when the room code is non-empty.
 *
 * @param {(mode: 'arcade'|'create'|'join', playerName: string, roomCode?: string) => void} onStartGame
 *   Callback invoked to start the game. For 'join', the third argument is the trimmed uppercase room code.
 * @returns {JSX.Element} The rendered main menu component.
 */
function MainMenu({ onStartGame }) {
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [showJoinRoom, setShowJoinRoom] = useState(false)

  const handleArcadeMode = () => {
    onStartGame('arcade', playerName || 'Player 1')
  }

  const handleCreateRoom = () => {
    onStartGame('create', playerName || 'Player 1')
  }

  const handleJoinRoom = () => {
    if (roomCode.trim()) {
      onStartGame('join', playerName || 'Player 2', roomCode.trim().toUpperCase())
    }
  }

  return (
    <div className="main-menu">
      <header className="logo-container">
        <img 
          src="/images/logo.svg" 
          className="game-logo" 
          alt="Connect 4 Tournament Fighter - Cyberpunk Terminal Edition" 
        />
      </header>
      
      <main className="menu-content" role="main">
        <div className="menu-buttons">
          <button 
            className="menu-button arcade-mode" 
            onClick={handleArcadeMode}
            aria-describedby="arcade-description"
          >
            <span role="img" aria-label="Game controller">🎮</span> Arcade Mode
          </button>
          <div id="arcade-description" className="visually-hidden">
            Play single-player tournament against 10 AI opponents
          </div>
          
          <button className="menu-button create-room" onClick={handleCreateRoom}>
            Create Online Room
          </button>
          
          {!showJoinRoom ? (
            <button className="menu-button join-room" onClick={() => setShowJoinRoom(true)}>
              Join Online Room
            </button>
          ) : (
            <div className="join-room-section">
              <input
                type="text"
                className="room-code-input"
                placeholder="Enter room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
              />
              <div className="join-buttons">
                <button className="menu-button confirm-join" onClick={handleJoinRoom}>
                  Join
                </button>
                <button className="menu-button cancel-join" onClick={() => {
                  setShowJoinRoom(false)
                  setRoomCode('')
                }}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="instructions">
          <p>Connect 4 discs in a row to win!</p>
          <p>Play locally or online with friends</p>
        </div>
      </main>
    </div>
  )
}

export default MainMenu