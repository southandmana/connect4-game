import AIOpponent from './AIOpponent.js'

class TournamentManager {
  constructor() {
    this.currentOpponent = 1
    this.maxOpponents = 10
    this.wins = 0
    this.losses = 0
    this.isComplete = false
    this.isVictorious = false
    this.currentAI = null
    this.tournamentStarted = false
  }

  // Initialize or restart tournament
  startTournament() {
    this.currentOpponent = 1
    this.wins = 0
    this.losses = 0
    this.isComplete = false
    this.isVictorious = false
    this.tournamentStarted = true
    this.currentAI = new AIOpponent(this.currentOpponent, this.currentOpponent)
    return this.currentAI
  }

  // Get current opponent info
  getCurrentOpponent() {
    if (!this.currentAI) {
      this.currentAI = new AIOpponent(this.currentOpponent, this.currentOpponent)
    }
    return this.currentAI
  }

  // Handle match result and advance tournament
  handleMatchResult(playerWon) {
    if (this.isComplete) return

    if (playerWon) {
      this.wins++
      
      // Check if tournament is complete
      if (this.currentOpponent >= this.maxOpponents) {
        this.isComplete = true
        this.isVictorious = true
        return {
          tournamentComplete: true,
          victory: true,
          message: `🏆 TOURNAMENT CHAMPION! You defeated all ${this.maxOpponents} opponents!`
        }
      } else {
        // Advance to next opponent
        this.currentOpponent++
        this.currentAI = new AIOpponent(this.currentOpponent, this.currentOpponent)
        return {
          tournamentComplete: false,
          victory: false,
          advance: true,
          nextOpponent: this.currentAI,
          message: `Victory! Advancing to opponent ${this.currentOpponent}: ${this.currentAI.name}`
        }
      }
    } else {
      this.losses++
      this.isComplete = true
      this.isVictorious = false
      
      return {
        tournamentComplete: true,
        victory: false,
        message: `💀 Tournament Over! You were defeated by ${this.currentAI.name}. Better luck next time!`
      }
    }
  }

  // Get tournament progress info
  getProgress() {
    return {
      currentOpponent: this.currentOpponent,
      totalOpponents: this.maxOpponents,
      wins: this.wins,
      losses: this.losses,
      progressPercentage: (this.currentOpponent / this.maxOpponents) * 100,
      isComplete: this.isComplete,
      isVictorious: this.isVictorious
    }
  }

  // Get current opponent difficulty info
  getDifficultyInfo() {
    const difficultyNames = [
      'Beginner',      // 1-2
      'Easy',          // 3-4  
      'Medium',        // 5-6
      'Hard',          // 7-8
      'Expert'         // 9-10
    ]
    
    const difficultyIndex = Math.min(Math.floor((this.currentOpponent - 1) / 2), 4)
    const difficultyName = difficultyNames[difficultyIndex]
    
    return {
      level: this.currentOpponent,
      name: difficultyName,
      isFinalBoss: this.currentOpponent === this.maxOpponents
    }
  }

  // Get opponent description for VS screen
  getOpponentDescription() {
    const descriptions = [
      'A newcomer to the cyber tournament. Still learning the ways of Connect 4.',
      'Growing stronger with each code cycle. Shows promise in strategic thinking.',
      'A seasoned fighter who scouts the board for opportunities.',
      'Aggressive and tactical, this warrior fights with digital intensity.',
      'Elite guard of the system. Defends positions with calculated precision.',
      'A knight of neon light with advanced strategic knowledge.',
      'Master of cyber tactics. Few have survived this challenge.',
      'Digital master of the game. Every move is calculated for maximum impact.',
      'Death incarnate. The Ghost Hacker harvests victories mercilessly.',
      '👑 THE FINAL BOSS: Lord of the mainframe. Undefeated champion of Connect 4.'
    ]
    
    return descriptions[this.currentOpponent - 1] || 'A mysterious opponent from the depths.'
  }

  // Reset tournament
  reset() {
    this.currentOpponent = 1
    this.wins = 0
    this.losses = 0
    this.isComplete = false
    this.isVictorious = false
    this.currentAI = null
    this.tournamentStarted = false
  }

  // Get tournament stats for display
  getStats() {
    return {
      currentMatch: `${this.currentOpponent}/${this.maxOpponents}`,
      record: `${this.wins}W - ${this.losses}L`,
      winRate: this.wins > 0 ? ((this.wins / (this.wins + this.losses)) * 100).toFixed(1) + '%' : '0%'
    }
  }

  // Check if specific milestone reached
  isMilestone() {
    // Every 3rd opponent is a milestone, plus the final boss
    return this.currentOpponent % 3 === 0 || this.currentOpponent === this.maxOpponents
  }

  // Get special message for milestones
  getMilestoneMessage() {
    if (this.currentOpponent === 3) return "🔥 You've proven yourself worthy! The real challenge begins..."
    if (this.currentOpponent === 6) return "⚔️ Halfway through the gauntlet! The enemies grow stronger..."
    if (this.currentOpponent === 9) return "💀 Only the final boss remains! Prepare for the ultimate test..."
    if (this.currentOpponent === 10) return "👑 FINAL BOSS: Face the Lord of the Underworld!"
    return null
  }
}

export default TournamentManager