# Full Code Review Request

This branch is created specifically to request a comprehensive code review of the entire Connect 4 game codebase.

## Request for CodeRabbit

@coderabbitai please perform a thorough review of all files in this repository including:

- Code quality and best practices
- Security vulnerabilities 
- Performance optimizations
- Bug detection
- Architecture suggestions
- Documentation improvements

## Setup / Run

### Requirements
- Node.js 18+ (recommended: use `.nvmrc` to pin version)
- npm 9+ (or yarn 1.22+ / pnpm 8+)

### Installation & Start
```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
```

### Environment

Create `.env.local` (already gitignored):
```bash
# Firebase config (VITE_ prefix required for client-side access)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Firebase Setup
- Install Firebase CLI: `npm install -g firebase-tools`
- Start emulator: `firebase emulators:start` (requires firebase.json)
- Security rules location: `firestore.rules` / `database.rules.json`

### Testing
```bash
# No test framework currently configured
# To add: npm install --save-dev vitest @testing-library/react
# Then: npm run test && npm run coverage
```

## Codebase Overview

This is a React-based Connect 4 game featuring:
- Single-player arcade mode with AI tournament
- Online multiplayer via Firebase
- Character selection system
- Sound effects and animations
- Stress/timer mechanics
- Cyberpunk terminal theme

Please provide detailed feedback on all aspects of the codebase.