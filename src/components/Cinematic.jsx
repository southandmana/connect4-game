import React, { useState, useEffect } from 'react'
import './Cinematic.css'

function Cinematic({ character, type, onComplete }) {
  const [currentScene, setCurrentScene] = useState(0)
  const [showText, setShowText] = useState(false)
  
  // Get cinematic data based on character and type (opening/ending)
  const getCinematicData = () => {
    const cinematics = {
      southern: {
        opening: [
          {
            image: '/images/cinematics/southern-opening-1.jpg',
            text: 'Deep in the fiery depths of the underworld, Southern emerges from the flames...',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImZpcmVHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjY5MDQiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2ZmNDUwMCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzhhMDAwMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2ZpcmVHcmFkaWVudCkiLz48Y2lyY2xlIGN4PSI0MDAiIGN5PSIzMDAiIHI9IjEwMCIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjMiLz48dGV4dCB4PSI0MDAiIHk9IjMxMCIgZm9udC1zaXplPSI0MCIgZmlsbD0iI2ZmNjkwNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkZyZWRva2EsIHNhbnMtc2VyaWYiPvCfk6U8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSI4MCIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmY2NhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkZyZWRva2EsIHNhbnMtc2VyaWYiPlNPVVRIRVJOJmFwb3M7UyBPUEVOSU5HPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMTA1IiBmb250LXNpemU9IjIwIiBmaWxsPSIjZmZjY2FhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iRnJlZG9rYSwgc2Fucy1zZXJpZiI+Q0lORU1BVElDIDE8L3RleHQ+PC9zdmc+'
          },
          {
            image: '/images/cinematics/southern-opening-2.jpg',
            text: 'The tournament calls, and Southern answers with fury and determination.',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImZpcmVHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZjQ1MDAiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iIzhhMDAwMCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzMzMDAwMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2ZpcmVHcmFkaWVudCkiLz48Y2lyY2xlIGN4PSI0MDAiIGN5PSIzMDAiIHI9IjEyMCIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjQiLz48dGV4dCB4PSI0MDAiIHk9IjMxNSIgZm9udC1zaXplPSI1MCIgZmlsbD0iI2ZmNDUwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkZyZWRva2EsIHNhbnMtc2VyaWYiPvCfkoU8L3RleHQ+PHRleHQgeD0iNDAwIiB5PSI4MCIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmY2NhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkZyZWRva2EsIHNhbnMtc2VyaWYiPlNPVVRIRVJOJmFwb3M7UyBPUEVOSU5HPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iMTA1IiBmb250LXNpemU9IjIwIiBmaWxsPSIjZmZjY2FhIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iRnJlZG9rYSwgc2Fucy1zZXJpZiI+Q0lORU1BVElDIDI8L3RleHQ+PC9zdmc+'
          },
          {
            image: '/images/cinematics/southern-opening-3.jpg',
            text: 'Let the Connect 4 tournament begin! May the strongest strategist prevail!',
            fallbackImage: 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgODAwIDYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImZpcmVHcmFkaWVudCIgeDE9IjAlIiB5MT0iMCUiIHgyPSIwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmZmQ3MDAiLz48c3RvcCBvZmZzZXQ9IjUwJSIgc3RvcC1jb2xvcj0iI2ZmNDUwMCIvPjxzdG9wIG9mZnNldD0iMTAwJSIgc3RvcC1jb2xvcj0iIzRkMDAwMCIvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2ZpcmVHcmFkaWVudCkiLz48Y2lyY2xlIGN4PSI0MDAiIGN5PSIzMDAiIHI9IjgwIiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuNSIvPjx0ZXh0IHg9IjQwMCIgeT0iMzE1IiBmb250LXNpemU9IjYwIiBmaWxsPSIjZmZkNzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iRnJlZG9rYSwgc2Fucy1zZXJpZiI+4p2k77iPPC90ZXh0Pjx0ZXh0IHg9IjQwMCIgeT0iODAiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmNjYWEiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJGcmVkb2thLCBzYW5zLXNlcmlmIj5TT1VUSEVSTiZhcG9zO1MgT1BFTklORzwvdGV4dD48dGV4dCB4PSI0MDAiIHk9IjEwNSIgZm9udC1zaXplPSIyMCIgZmlsbD0iI2ZmY2NhYSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkZyZWRva2EsIHNhbnMtc2VyaWYiPkNJTkVNQVRJQyAzPC90ZXh0Pjwvc3ZnPg=='
          }
        ],
        ending: [
          // Ending cinematics will be added later
        ]
      }
    }
    
    return cinematics[character.id]?.[type] || []
  }

  const scenes = getCinematicData()
  const currentSceneData = scenes[currentScene]

  useEffect(() => {
    // Show text with a slight delay after component mounts
    const timer = setTimeout(() => {
      setShowText(true)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [currentScene])

  const handleNext = () => {
    if (currentScene < scenes.length - 1) {
      setShowText(false)
      setTimeout(() => {
        setCurrentScene(currentScene + 1)
      }, 300)
    } else {
      // Cinematic is complete
      onComplete()
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  if (!currentSceneData) {
    // No cinematic data, skip directly to next stage
    onComplete()
    return null
  }

  return (
    <div className="cinematic" onClick={handleNext}>
      <div className="cinematic-background">
        <img 
          src={currentSceneData.image} 
          alt={`${character.name} cinematic scene ${currentScene + 1}`}
          className="cinematic-image"
          onError={(e) => {
            e.target.src = currentSceneData.fallbackImage
          }}
        />
        <div className="cinematic-overlay"></div>
      </div>
      
      <div className={`cinematic-text-overlay ${showText ? 'show' : ''}`}>
        <div className="cinematic-text">
          {currentSceneData.text}
        </div>
        
        <div className="cinematic-controls">
          <div className="continue-prompt">
            {currentScene < scenes.length - 1 ? 'Tap to continue...' : 'Tap to start tournament...'}
          </div>
          
          <button className="skip-button" onClick={handleSkip}>
            Skip ⏭️
          </button>
        </div>
      </div>
      
      <div className="cinematic-progress">
        {scenes.map((_, index) => (
          <div 
            key={index} 
            className={`progress-dot ${index <= currentScene ? 'active' : ''}`}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default Cinematic