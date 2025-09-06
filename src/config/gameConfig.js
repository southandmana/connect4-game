// Central game configuration file
// This file contains all hardcoded values used throughout the Connect4 game

export const GAME_CONFIG = {
  // Board Configuration
  BOARD_ROWS: 6,
  BOARD_COLS: 7,
  WINNING_LENGTH: 4,

  // Player Configuration
  PLAYER_COLORS: {
    PLAYER_ONE: "red",
    PLAYER_TWO: "yellow"
  },

  DEFAULT_NAMES: {
    PLAYER_ONE: "Player 1",
    PLAYER_TWO: "Player 2"
  },

  // Game Modes
  GAME_MODES: {
    ARCADE: "arcade",
    CREATE: "create",
    JOIN: "join",
    LOCAL: "local"
  },

  // Timer Configuration
  TIMER: {
    MAX_TURN_TIME: 30, // seconds
    WARNING_TIME: 5,   // seconds remaining to show warning
    STRESS_INCREMENT: 10, // stress points per second over time
    MAX_STRESS: 100    // maximum stress before game over
  },

  // AI Configuration
  AI: {
    MIN_DIFFICULTY: 1,
    MAX_DIFFICULTY: 10,
    
    // Scoring system for AI evaluation
    SCORES: {
      WIN: 1000,
      LOSE: -1000,
      FOUR_IN_ROW: 100,
      THREE_WITH_EMPTY: 10,
      THREE_BLOCK: -80,
      TWO_WITH_EMPTY: 2
    },

    // Randomness configuration
    RANDOMNESS: {
      BASE: 0.5,
      REDUCTION: 0.05,
      MIN: 0.05
    },

    // AI opponent names by difficulty level
    OPPONENT_NAMES: [
      'Code Novice',
      'Cyber Warrior', 
      'Net Scout',
      'Data Fighter',
      'System Guard',
      'Neon Knight',
      'AI Strategist',
      'Digital Master',
      'Ghost Hacker',
      'The Mainframe'
    ]
  },

  // Tournament Configuration
  TOURNAMENT: {
    TOTAL_OPPONENTS: 10,
    BASE_SCORE: 1000,
    DIFFICULTY_BONUS: 200,
    PERFECT_VICTORY_BONUS: 500,
    FINAL_BOSS_BONUS: 2000,
    CHAMPION_BONUS: 5000,
    PARTIAL_SCORE_MULTIPLIER: 50
  },

  // Animation Durations (in milliseconds)
  ANIMATIONS: {
    STORY_INTRO: 2700,
    BATTLE_TRANSITION: 2000,
    VICTORY_MOMENT: 3000,
    DEFEAT_MOMENT: 3000,
    ADVANCING_TRANSITION: 2500,
    CINEMATIC_AUTO_ADVANCE: 800,
    DISC_DROP: 300,
    WIN_CELEBRATION: 2000
  },

  // UI Configuration
  UI: {
    ROOM_CODE_LENGTH: 6,
    CONNECTION_RETRY_DELAY: 3000, // milliseconds
    HEALTH_CHECK_INTERVAL: 5000,  // milliseconds
    MAX_RECONNECT_ATTEMPTS: 3
  },

  // Audio Configuration
  AUDIO: {
    BACKGROUND_VOLUME: 0.3,
    SFX_VOLUME: 0.7,
    MUTE_STORAGE_KEY: 'connect4_muted'
  },

  // Visual Effects
  EFFECTS: {
    PARTICLE_COUNT: 50,
    SHAKE_DURATION: 500,
    GLOW_PULSE_DURATION: 1000,
    BORDER_ANIMATION_SPEED: 2000
  }
}

export default GAME_CONFIG