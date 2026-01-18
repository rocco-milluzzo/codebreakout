# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CODEBREAKOUT is a multi-themed brick breaker game (Arkanoid-style) built with vanilla JavaScript ES modules, HTML5 Canvas, and CSS3. Players can choose between three themes (CODE/CAKE/ASTRO) and progress through 15 main levels plus 8 bonus stages with increasing difficulty.

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
├── levels.js          # LEVELS array (15 main levels + 8 bonus)
├── themes.js          # Theme definitions (CODE/CAKE/ASTRO)
├── powerups.js        # POWERUP_TYPES definitions
├── brickTypes.js      # BRICK_TYPES definitions
├── state.js           # GameState class (score, lives, multiplier, etc.)
├── achievements.js    # Achievement definitions and check logic
├── cosmetics.js       # Paddle skins, trails, backgrounds
├── i18n.js            # Internationalization (EN/IT translations)
├── easterEggs.js      # Combo quotes and special attacks
├── entities/
│   ├── paddle.js      # Paddle creation, movement, magnet logic
│   ├── ball.js        # Ball creation, launch, movement, speed
│   ├── brick.js       # Brick patterns, creation, hit logic
│   └── powerup.js     # Powerup/laser entity spawn and collision
├── systems/
│   ├── input.js       # InputManager (keyboard, mouse, touch)
│   ├── collision.js   # Collision detection functions
│   ├── render.js      # All Canvas drawing functions (includes roundRect polyfill)
│   ├── audio.js       # AudioManager using Web Audio API
│   ├── storage.js     # LocalStorage + API high score persistence
│   ├── theme.js       # ThemeManager - applies and cycles themes
│   ├── particles.js   # Particle effects system
│   └── haptics.js     # Haptic feedback support
└── main.js            # CodeBreakout class, game loop, initialization
```

### Key Files

- `index.html` - Game container with all UI screens (uses `<script type="module">`)
- `styles.css` - All styling including CSS custom properties for theming
- `Dockerfile` - nginx-based container for deployment
- `docker-compose.yml` - Full stack orchestration with PostgreSQL

### Main Game Class (src/main.js)

The `CodeBreakout` class orchestrates the game:
- Screen management (`showScreen`)
- Game loop (`gameLoop` -> `update` -> `render`)
- Entity coordination (paddle, balls, bricks, powerups, lasers)
- Powerup application and expiration
- Theme and language switching
- Achievement tracking
- High score handling with duplicate prevention

### Theme System (src/themes.js, src/systems/theme.js)

Three visual themes with identical mechanics:
- **CODE**: Programming languages (HTML → Assembly), tech/angular style
- **CAKE**: Desserts (Cupcake → Wedding Cake), soft/rounded style
- **ASTRO**: Space (Moon → Big Bang), glowing/space style

Each theme defines:
- Level names, colors, descriptions
- Visual style (brick shape, glow, particle style)
- Meta tags (title, description for SEO)

### Internationalization (src/i18n.js)

Supports English and Italian. Uses `t('key')` function for translations.
Level descriptions are theme-specific in the translations.

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
- Brick pattern name
- Level-specific mechanics (`moving_bricks`, `portal_bricks`, `split_ball`, etc.)

### Brick Patterns (src/entities/brick.js)

`getBrickPattern()` returns 2D arrays. Values:
- 0 = empty
- 1 = standard
- 2 = strong (2 hits)
- 3 = tough (3 hits)
- -1 = unbreakable
- 4 = hazard
- 5 = portal
- 6 = exploding

### Powerup System

**Positive**: MULTIBALL, WIDE_PADDLE, SLOWMO, LASER, SHIELD, MAGNET, FIREBALL
**Negative**: MINI_PADDLE, FAST_BALL, GLITCH

Powerups track expiry times in `state.activePowerups` and expire via `state.getExpiredPowerups()`.

### Achievement System (src/achievements.js)

26 achievements tracked via `checkAchievement()`. Types:
- levels, combo, perfect, speedLevel
- bonusType, ballCount, totalScore
- malusCount, gamesPlayed, playTime

### Render System (src/systems/render.js)

- Includes roundRect polyfill for Safari < 16 compatibility
- Theme-specific brick rendering (angular/rounded/space styles)
- Ball effects (fireball, slowmo, fastball)
- Particle system integration

### Storage System (src/systems/storage.js)

- API backend with localStorage fallback
- `createTimeoutSignal()` helper for browser compatibility
- Progress persistence (cosmetics, achievements, settings)

## Tech Stack

- Vanilla JavaScript ES6 modules
- HTML5 Canvas for rendering
- Web Audio API for procedural sound effects and music
- LocalStorage + PostgreSQL for persistence
- JetBrains Mono font via Google Fonts
- Docker + nginx for deployment

## No Build Step

Zero-dependency project with no build process. All code runs directly in the browser via ES modules. Docker provides a production-ready deployment option.

## Testing

```bash
npm install
npm test  # Runs vitest with 752 tests
```

Tests cover all modules including entities, systems, achievements, and Easter eggs.
