import { ref, set, onValue, off, remove } from 'firebase/database'
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
      this.roomId = this.generateRoomCode()
      this.playerId = uuidv4()
      this.playerColor = 'red'
      this.roomRef = ref(database, `rooms/${this.roomId}`)
      
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
      
      await set(this.roomRef, initialData)
      
      const unsubscribe = onValue(this.roomRef, (snapshot) => {
        const data = snapshot.val()
        if (data) {
          onGameUpdate(data)
        }
      })
      
      this.listeners.push({ ref: this.roomRef, callback: unsubscribe })
      
      return this.roomId
    } catch (error) {
      onError(error)
      throw error
    }
  }

  async joinRoom(roomCode, playerName, onGameUpdate, onError) {
    try {
      this.roomId = roomCode.toUpperCase()
      this.playerId = uuidv4()
      this.playerColor = 'yellow'
      this.roomRef = ref(database, `rooms/${this.roomId}`)
      
      const unsubscribe = onValue(this.roomRef, (snapshot) => {
        const data = snapshot.val()
        if (!data) {
          onError(new Error('Room not found'))
          return
        }
        
        if (!data.guest && data.host) {
          set(ref(database, `rooms/${this.roomId}/guest`), {
            id: this.playerId,
            name: playerName,
            color: 'yellow'
          })
        }
        
        onGameUpdate(data)
      })
      
      this.listeners.push({ ref: this.roomRef, callback: unsubscribe })
      
      return this.roomId
    } catch (error) {
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
    
    const updateRefs = {}
    Object.keys(updates).forEach(key => {
      updateRefs[key] = updates[key]
    })
    
    await set(this.roomRef, updateRefs)
  }

  disconnect() {
    this.listeners.forEach(({ callback }) => {
      if (callback) off(callback)
    })
    
    if (this.roomRef && this.roomId) {
      remove(this.roomRef)
    }
    
    this.roomRef = null
    this.roomId = null
    this.playerId = null
    this.playerColor = null
    this.listeners = []
  }
}

export default OnlineGameManager