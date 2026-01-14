# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CODEBREAKOUT is a programming-themed brick breaker game (Arkanoid-style) built with vanilla JavaScript ES modules, HTML5 Canvas, and CSS3. Players progress through 15 levels, each themed around a programming language from HTML to Assembly, with increasing difficulty.

## Running the Game

### Docker (Recommended)

```bash
docker compose up -d
# Visit http://localhost:3000
```

### Local Server

```bash
python3 -m http.server 8080
# Visit http://localhost:8080
```

Note: ES modules require a server - opening `index.html` directly won't work.

## Architecture

### Project Structure

```
src/
├── config.js          # CONFIG object with all game constants
├── levels.js          # LEVELS array (15 programming language levels)
├── powerups.js        # POWERUP_TYPES definitions
├── brickTypes.js      # BRICK_TYPES definitions
├── state.js           # GameState class (score, lives, multiplier, etc.)
├── entities/
│   ├── paddle.js      # Paddle creation, movement, magnet logic
│   ├── ball.js        # Ball creation, launch, movement, speed
│   ├── brick.js       # Brick patterns (15 patterns), creation, hit logic
│   └── powerup.js     # Powerup/laser entity spawn and collision
├── systems/
│   ├── input.js       # InputManager (keyboard, mouse, touch)
│   ├── collision.js   # Collision detection functions
│   ├── render.js      # All Canvas drawing functions
│   ├── audio.js       # AudioManager using Web Audio API
│   └── storage.js     # LocalStorage high score persistence
└── main.js            # CodeBreakout class, game loop, initialization
```

### Key Files

- `index.html` - Game container with all UI screens (uses `<script type="module">`)
- `styles.css` - All styling including CSS custom properties for theming
- `Dockerfile` - nginx-based container for deployment
- `docker-compose.yml` - Easy container orchestration

### Main Game Class (src/main.js)

The `CodeBreakout` class orchestrates the game:
- Screen management (`showScreen`)
- Game loop (`gameLoop` -> `update` -> `render`)
- Entity coordination (paddle, balls, bricks, powerups, lasers)
- Powerup application and expiration
- High score handling with duplicate prevention

### GameState (src/state.js)

Centralized game state with helper methods:
- `addScore()`, `incrementMultiplier()`, `resetMultiplier()`
- `loseLife()` - returns true if game over
- `isPowerupActive()`, `activatePowerup()`, `getExpiredPowerups()`
- `scoreSubmitted` flag prevents duplicate high score entries

### Configuration (src/config.js)

Tunable parameters for:
- Canvas dimensions, paddle/ball sizes and speeds
- Brick grid layout
- Gameplay values (lives, multiplier cap)
- Powerup durations

### Levels (src/levels.js)

Each level defines:
- Visual color, paddle width, ball speed
- Brick pattern name (15 patterns available)
- Level-specific mechanics (`moving_bricks`, `portal_bricks`, `split_ball`, etc.)

### Brick Patterns (src/entities/brick.js)

`getBrickPattern()` returns 2D arrays. Values: 0=empty, 1=standard, 2=strong, 3=tough, -1=unbreakable, 4=hazard, 5=portal, 6=exploding.

### Powerup System

Positive: MULTIBALL, WIDE_PADDLE, SLOWMO, LASER, SHIELD, MAGNET
Negative: MINI_PADDLE, FAST_BALL, GLITCH

Powerups track expiry times in `state.activePowerups` and expire via `state.getExpiredPowerups()`.

## Tech Stack

- Vanilla JavaScript ES6 modules
- HTML5 Canvas for rendering
- Web Audio API for procedural sound effects
- LocalStorage for high score persistence
- JetBrains Mono font via Google Fonts
- Docker + nginx for deployment

## No Build Step

Zero-dependency project with no build process. All code runs directly in the browser via ES modules. Docker provides a production-ready deployment option.
