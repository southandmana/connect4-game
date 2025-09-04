class SoundManager {
  constructor() {
    this.sounds = {}
    this.musicVolume = 0.3
    this.effectsVolume = 0.5
    this.isMuted = false
    
    // Ultra-efficient visualizer properties
    this.audioContext = null
    this.analyser = null
    this.source = null
    this.frequencyData = null
    this.visualizerEnabled = true
    this.lastHueUpdate = 0
    this.currentHue = 0
    this.updateInterval = null
    
    // Performance constants - EFFICIENT MODE
    this.ANALYSIS_INTERVAL = 150 // ms - ultra low frequency analysis
    this.THROTTLE_MS = 100 // Minimum time between hue updates
    this.HUE_SENSITIVITY = 0.8 // Balanced sensitivity
    this.MAX_HUE_SHIFT = 30 // Subtle hue range for performance
    this.INTENSITY_MULTIPLIER = 1.0 // Moderate response
    this.BASS_THRESHOLD = 40 // Minimum level to ignore noise
  }

  init() {
    // Try to load custom background music first
    this.sounds.backgroundMusic = new Audio()
    this.sounds.backgroundMusic.loop = true
    this.sounds.backgroundMusic.volume = this.musicVolume
    
    // Try custom music file first with cache busting
    this.sounds.backgroundMusic.src = `/audio/background-music.mp3?v=${Date.now()}`
    
    // Add error handling
    this.sounds.backgroundMusic.addEventListener('error', () => {
      console.warn('Custom background music failed to load, using fallback')
      this.sounds.backgroundMusic.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBziS2Oy9diMFl2+z17pVFAk2n+v4kj0TBzSYzuzHhncFNYXYrOOkNwBCnOPfs3cgBjiS3Pz+hVsHPpbS6MOJWwAyiMzp2e2mTggUcd/i3H0xByyBzvjwq4AHLJzO5NWnVRYGLYXc/OurWxgGO5La+PW5Uxg/munRfS0GH4Pa8tiJUAgrjdjz4YEwBzqb1+zbyjsEQZ7a5biJQAcrisvZ4JdEBTGHy+DU'
      this.sounds.backgroundMusic.volume = this.musicVolume
    })
    
    this.sounds.backgroundMusic.addEventListener('canplaythrough', () => {
      console.log('Background music loaded successfully')
    })
    
    this.sounds.backgroundMusic.addEventListener('loadstart', () => {
      console.log('Loading background music from:', this.sounds.backgroundMusic.src)
    })
    
    this.sounds.dropSound = new Audio('data:audio/wav;base64,UklGRiQBAABXQVZFZm10IBAAAAABAAEAIlYAAIJYAAACAAgAZGF0YQABAAAAAAAJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQ==')
    this.sounds.dropSound.volume = this.effectsVolume
    
    this.sounds.winSound = new Audio('data:audio/wav;base64,UklGRmQCAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACAAgAZGF0YUACAADt7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u')
    this.sounds.winSound.volume = this.effectsVolume
    
    // Initialize ultra-efficient visualizer
    this.initVisualizer()
  }

  // Ultra-efficient audio visualizer initialization
  initVisualizer() {
    try {
      // Create Web Audio API context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
      
      // Create analyzer with minimal FFT size for maximum efficiency
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = 64 // Smallest size = only 32 frequency bins
      this.analyser.smoothingTimeConstant = 0.3 // Light smoothing for stability
      
      // Only need 4 bins for bass range (covers ~40-200Hz)
      this.frequencyData = new Uint8Array(4)
      
      console.log('Music visualizer initialized - Ultra-efficient mode')
    } catch (error) {
      console.warn('Visualizer not supported:', error)
      this.visualizerEnabled = false
    }
  }

  // Connect audio source to analyzer when music starts
  connectVisualizer() {
    if (!this.visualizerEnabled || !this.audioContext || this.source) return
    
    try {
      this.source = this.audioContext.createMediaElementSource(this.sounds.backgroundMusic)
      this.source.connect(this.analyser)
      this.analyser.connect(this.audioContext.destination)
      
      console.log('Visualizer connected to audio source')
    } catch (error) {
      console.warn('Could not connect visualizer:', error)
      this.visualizerEnabled = false
    }
  }

  // DYNAMIC bass frequency analysis - tuned for bass-heavy music
  analyzeBassFrequency() {
    if (!this.visualizerEnabled || !this.analyser) return { hue: 0, intensity: 0 }
    
    // Get only the bass frequency bins (bins 1-3 cover ~40-200Hz)
    this.analyser.getByteFrequencyData(this.frequencyData)
    
    // Debug logging - remove after testing
    if (Math.random() < 0.1) { // Log 10% of the time to avoid spam
      console.log('Bass bins:', this.frequencyData[1], this.frequencyData[2], this.frequencyData[3])
    }
    
    // Calculate raw bass with threshold to ignore noise
    const rawBass = Math.max(0, 
      ((this.frequencyData[1] + this.frequencyData[2] + this.frequencyData[3]) / 3) - this.BASS_THRESHOLD
    )
    
    // Normalize to 0-1 range with adjusted scaling for bass-heavy tracks
    const normalizedBass = Math.min(1, (rawBass / (255 - this.BASS_THRESHOLD)) * this.INTENSITY_MULTIPLIER)
    
    // Use logarithmic curve for more dynamic response across the range
    const dynamicIntensity = Math.log10(1 + normalizedBass * 9) / Math.log10(10) // Maps 0-1 more evenly
    
    // Calculate hue shift with better dynamic range
    const hueShift = dynamicIntensity * this.MAX_HUE_SHIFT * this.HUE_SENSITIVITY
    
    // Add subtle oscillation for movement
    const oscillation = (Math.abs(this.frequencyData[1] - this.frequencyData[3]) / 255) * 5
    
    // Debug log final values occasionally
    if (Math.random() < 0.05) { // Log 5% of the time
      console.log('Hue shift:', hueShift, 'Intensity:', dynamicIntensity * 100)
    }
    
    return {
      hue: hueShift + oscillation,
      intensity: dynamicIntensity
    }
  }

  // DRAMATIC multi-effect update for maximum visual impact
  updateBackgroundHue() {
    const now = performance.now()
    if (now - this.lastHueUpdate < this.THROTTLE_MS) return
    
    const bassData = this.analyzeBassFrequency()
    
    // Only update if significant change (reduces unnecessary repaints)
    if (Math.abs(bassData.hue - this.currentHue) > 1.5) {
      this.currentHue = bassData.hue
      
      // DRAMATIC MULTI-EFFECT UPDATES
      // Primary hue shift (red->orange->yellow->green->blue spectrum)
      document.documentElement.style.setProperty('--bass-hue-shift', `${bassData.hue}deg`)
      
      // Secondary intensity-based effects
      const intensityPercent = Math.round(bassData.intensity * 100)
      document.documentElement.style.setProperty('--bass-intensity', `${intensityPercent}%`)
      
      // Moderate saturation for efficiency
      const dynamicSaturation = 70 + (bassData.intensity * 30) // 70-100% saturation
      document.documentElement.style.setProperty('--bass-saturation', `${dynamicSaturation}%`)
      
      this.lastHueUpdate = now
    }
  }

  // Start ultra-efficient visualizer loop
  startVisualizer() {
    if (!this.visualizerEnabled) return
    
    // Ultra-low frequency updates (150ms interval)
    this.updateInterval = setInterval(() => {
      this.updateBackgroundHue()
    }, this.ANALYSIS_INTERVAL)
    
    console.log('Music visualizer started - Bass-reactive hue shifting active')
  }

  // Stop visualizer loop
  stopVisualizer() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
      
      // Reset all effects to baseline
      document.documentElement.style.setProperty('--bass-hue-shift', '0deg')
      document.documentElement.style.setProperty('--bass-intensity', '0%')
      document.documentElement.style.setProperty('--bass-saturation', '70%')
      this.currentHue = 0
    }
  }

  playBackgroundMusic() {
    if (!this.isMuted && this.sounds.backgroundMusic) {
      console.log('Playing background music from:', this.sounds.backgroundMusic.src)
      console.log('Audio duration:', this.sounds.backgroundMusic.duration)
      console.log('Audio ready state:', this.sounds.backgroundMusic.readyState)
      
      this.sounds.backgroundMusic.play().then(() => {
        // Connect visualizer once audio is playing
        this.connectVisualizer()
        this.startVisualizer()
      }).catch((error) => {
        console.error('Error playing background music:', error)
      })
    }
  }

  stopBackgroundMusic() {
    if (this.sounds.backgroundMusic) {
      this.sounds.backgroundMusic.pause()
      this.sounds.backgroundMusic.currentTime = 0
      
      // Stop visualizer when music stops
      this.stopVisualizer()
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

  // Toggle visualizer (for performance/accessibility options)
  toggleVisualizer() {
    this.visualizerEnabled = !this.visualizerEnabled
    if (!this.visualizerEnabled) {
      this.stopVisualizer()
    } else if (!this.isMuted && this.sounds.backgroundMusic && !this.sounds.backgroundMusic.paused) {
      this.connectVisualizer()
      this.startVisualizer()
    }
    return this.visualizerEnabled
  }
}

export default new SoundManager()