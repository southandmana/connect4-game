import { ref, set, get, onValue, off, remove } from 'firebase/database'
import { database } from '../firebase'
import { v4 as uuidv4 } from 'uuid'

class OnlineGameManager {
  constructor() {
    this.roomRef = null
    this.roomId = null
    this.playerId = null
    this.playerColor = null
    this.listeners = []
  }

  generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }

  async createRoom(playerName, onGameUpdate, onError) {
    try {
      console.log('Creating room for player:', playerName)
      const generatedCode = this.generateRoomCode()
      console.log('Generated room code:', generatedCode)
      this.roomId = generatedCode
      console.log('this.roomId after assignment:', this.roomId)
      this.playerId = uuidv4()
      this.playerColor = 'red'
      
      const roomPath = `rooms/${this.roomId}`
      this.roomRef = ref(database, roomPath)
      
      const initialData = {
        host: {
          id: this.playerId,
          name: playerName,
          color: 'red'
        },
        board: Array(6).fill(null).map(() => Array(7).fill(null)),
        currentPlayer: 'red',
        winner: null,
        isDraw: false,
        lastMove: null,
        createdAt: Date.now()
      }
      
      console.log('Setting initial data to Firebase...')
      console.log('Room path for creation:', roomPath)
      console.log('Initial data:', initialData)
      
      try {
        await set(this.roomRef, initialData)
        console.log('✅ Data set successfully! Room should be available for joining.')
      } catch (setError) {
        console.error('❌ Failed to set room data:', setError)
        throw setError
      }
      
      // Set up listener after successful data write
      try {
        const listenerRef = ref(database, roomPath)
        const unsubscribe = onValue(listenerRef, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            onGameUpdate(data)
          }
        }, (error) => {
          console.error('Firebase listener error:', error)
        })
        
        this.listeners.push({ ref: listenerRef, callback: unsubscribe })
        console.log('Listener set up successfully')
      } catch (listenerError) {
        console.error('Error setting up listener:', listenerError)
        // Don't throw - we can still return the room ID
      }
      
      console.log('About to return room ID. this.roomId =', this.roomId)
      console.log('generatedCode =', generatedCode)
      return generatedCode
    } catch (error) {
      console.error('Detailed error in createRoom:', error)
      onError(error)
      throw error
    }
  }

  async joinRoom(roomCode, playerName, onGameUpdate, onError) {
    try {
      this.roomId = roomCode.toUpperCase()
      this.playerId = uuidv4()
      this.playerColor = 'yellow'
      
      const roomPath = `rooms/${this.roomId}`
      this.roomRef = ref(database, roomPath)
      
      // First, check if the room exists
      console.log('Checking if room exists:', this.roomId)
      console.log('Room path:', roomPath)
      const roomSnapshot = await get(this.roomRef)
      const roomData = roomSnapshot.val()
      
      console.log('Room data found:', roomData)
      
      if (!roomData) {
        console.log('Room does not exist')
        onError(new Error('Room not found'))
        return
      }
      
      if (!roomData.host) {
        console.log('Room exists but has no host')
        onError(new Error('Room not found'))
        return
      }
      
      console.log('Room found, adding guest player')
      // Add guest player to the room
      const guestRef = ref(database, `${roomPath}/guest`)
      await set(guestRef, {
        id: this.playerId,
        name: playerName,
        color: 'yellow'
      })
      
      // Now set up listener for ongoing updates
      const listenerRef = ref(database, roomPath)
      const unsubscribe = onValue(listenerRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          onGameUpdate(data)
        }
      }, (error) => {
        console.error('Firebase listener error:', error)
        onError(error)
      })
      
      this.listeners.push({ ref: listenerRef, callback: unsubscribe })
      
      return roomCode.toUpperCase()
    } catch (error) {
      console.error('Detailed error in joinRoom:', error)
      onError(error)
      throw error
    }
  }

  async makeMove(col, board, currentPlayer) {
    if (!this.roomRef || currentPlayer !== this.playerColor) {
      return false
    }
    
    for (let row = 5; row >= 0; row--) {
      if (board[row][col] === null) {
        const newBoard = board.map(row => [...row])
        newBoard[row][col] = currentPlayer
        
        const updates = {
          board: newBoard,
          currentPlayer: currentPlayer === 'red' ? 'yellow' : 'red',
          lastMove: { row, col, player: currentPlayer }
        }
        
        await set(this.roomRef, { ...updates })
        return true
      }
    }
    
    return false
  }

  async updateGameState(updates) {
    if (!this.roomRef) return
    
    try {
      // Get current data
      const snapshot = await get(this.roomRef)
      const currentData = snapshot.val() || {}
      
      // Merge with updates
      const updatedData = {
        ...currentData,
        ...updates
      }
      
      // Save back to Firebase
      await set(this.roomRef, updatedData)
    } catch (error) {
      console.error('Error updating game state:', error)
    }
  }

  disconnect() {
    // Unsubscribe from all listeners
    this.listeners.forEach(({ ref, callback }) => {
      if (callback && ref) {
        off(ref, callback)
      }
    })
    
    // DON'T remove the room - let it persist for other players
    console.log('Disconnecting from room but leaving data for other players')
    
    this.roomRef = null
    this.roomId = null
    this.playerId = null
    this.playerColor = null
    this.listeners = []
  }
}

export default OnlineGameManager