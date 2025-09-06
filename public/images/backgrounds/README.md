# Arcade Mode Backgrounds

This folder contains background images for arcade mode transition screens.

## Required Files with Scene Descriptions:

### ✅ **game-background.webp** (existing)
Current Connect 4 game background

### 📋 **Missing Files Needed:**

#### **character-selection.webp**
- **Scene**: Arlen suburban backdrop with Connect 4 tournament setup
- **Mood**: Competitive, character-focused, tournament atmosphere  
- **Elements**: Tournament bracket, suburban setting, character portraits area
- **Style**: Wide establishing shot, flat design cartoon feel

#### **story-intro.webp**
- **Scene**: Suburban Arlen neighborhood establishing shot
- **Mood**: Welcoming, friendly suburban atmosphere
- **Elements**: Houses, lawns, maybe a fence or mailbox
- **Style**: Flat design cartoon, warm afternoon lighting

#### **battle-transition.webp** 
- **Scene**: Close-up of Connect 4 board with dramatic angle
- **Mood**: Intense, focused, ready for action
- **Elements**: Connect 4 pieces, game board detail, strategic viewpoint
- **Style**: Dynamic angle, high contrast flat colors

#### **vs-screen.webp**
- **Scene**: Face-off arena or confrontation setting
- **Mood**: Competitive tension, pre-battle atmosphere
- **Elements**: Arena-style layout, versus elements, character face-off space
- **Style**: Dynamic composition emphasizing competition and rivalry

#### **victory-moment.webp**
- **Scene**: Celebration scene with suburban backyard setting
- **Mood**: Triumphant, joyful, festive
- **Elements**: Confetti, trophy elements, victory symbols
- **Colors**: Bright golds and victory colors from theme (--accent: #c8860d)

#### **defeat-moment.webp**
- **Scene**: Somber suburban scene, muted atmosphere
- **Mood**: Contemplative, respectful defeat
- **Elements**: Quiet backyard, empty lawn chair, peaceful but sad
- **Colors**: Muted versions of theme colors, softer tones

#### **advancing-transition.webp**
- **Scene**: Tournament progression visual or pathway
- **Mood**: Anticipation, moving forward, next challenge
- **Elements**: Road/path leading forward, tournament bracket style, arrows
- **Style**: Clear direction of progress, motivational

#### **tournament-results.webp**
- **Scene**: Award ceremony or final scoreboard setting  
- **Mood**: Final, conclusive, championship atmosphere
- **Elements**: Podium, scoreboard, or achievement display
- **Style**: Formal but still cartoon suburban feel

## Design Specifications:
- **Resolution**: 1920x1080 pixels (cinematic ratio)
- **Format**: WebP preferred, JPG acceptable
- **File Size**: Under 200KB each for performance
- **Style**: **FLAT DESIGN** - no gradients, shadows, or 3D effects
- **Colors**: Use King of the Hill palette (creams #f5f3e8, golden #c8860d, suburban greens)
- **Theme**: Texas suburban/Arlen environments
- **Aesthetic**: Cartoon flat design like the TV show

## Color Palette Reference:
```
Background: #f5f3e8 (cream)
Accent: #c8860d (golden yellow)  
Success: #7a8b3a (suburban green)
Error: #b8573e (brick red)
```

## Implementation:
- CSS variables already configured in `src/styles/theme.css`
- Background system ready - images will automatically load when uploaded
- Fallback to solid colors if images missing