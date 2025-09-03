class SoundManager {
  constructor() {
    this.sounds = {}
    this.musicVolume = 0.3
    this.effectsVolume = 0.5
    this.isMuted = false
  }

  init() {
    this.sounds.backgroundMusic = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziS2Oy9diMFl2+z17pVFAk2n+v4kj0TBzSYzuzHhncFNYXYrOOkNwBCnOPfs3cgBjiS3Pz+hVsHPpbS6MOJWwAyiMzp2e2mTggUcd/i3H0xByyBzvjwq4AHLJzO5NWnVRYGLYXc/OurWxgGO5La+PW5Uxg/munRfS0GH4Pa8tiJUAgrjdjz4YEwBzqb1+zbyjsEQZ7a5biJQAcrisvZ4JdEBTGHy+DU')
    this.sounds.backgroundMusic.loop = true
    this.sounds.backgroundMusic.volume = this.musicVolume
    
    this.sounds.dropSound = new Audio('data:audio/wav;base64,UklGRiQBAABXQVZFZm10IBAAAAABAAEAIlYAAIJYAAACAAgAZGF0YQABAAAAAAAJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQ==')
    this.sounds.dropSound.volume = this.effectsVolume
    
    this.sounds.winSound = new Audio('data:audio/wav;base64,UklGRmQCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACAAgAZGF0YUACAADt7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u')
    this.sounds.winSound.volume = this.effectsVolume
  }

  playBackgroundMusic() {
    if (!this.isMuted && this.sounds.backgroundMusic) {
      this.sounds.backgroundMusic.play().catch(() => {})
    }
  }

  stopBackgroundMusic() {
    if (this.sounds.backgroundMusic) {
      this.sounds.backgroundMusic.pause()
      this.sounds.backgroundMusic.currentTime = 0
    }
  }

  playDropSound() {
    if (!this.isMuted && this.sounds.dropSound) {
      this.sounds.dropSound.currentTime = 0
      this.sounds.dropSound.play().catch(() => {})
    }
  }

  playWinSound() {
    if (!this.isMuted && this.sounds.winSound) {
      this.sounds.winSound.currentTime = 0
      this.sounds.winSound.play().catch(() => {})
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted
    if (this.isMuted) {
      this.stopBackgroundMusic()
    } else {
      this.playBackgroundMusic()
    }
    return this.isMuted
  }
}

export default new SoundManager()