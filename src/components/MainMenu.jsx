import React, { useState } from 'react'
import './MainMenu.css'

function MainMenu({ onStartGame }) {
  const [playerName, setPlayerName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [showJoinRoom, setShowJoinRoom] = useState(false)

  const handleLocalPlay = () => {
    onStartGame('local', playerName || 'Player 1')
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
      <h1 className="game-title">Connect 4</h1>
      <div className="menu-content">
        <input
          type="text"
          className="player-name-input"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          maxLength={20}
        />
        
        <div className="menu-buttons">
          <button className="menu-button local-play" onClick={handleLocalPlay}>
            Local Play
          </button>
          
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
      </div>
    </div>
  )
}

export default MainMenu