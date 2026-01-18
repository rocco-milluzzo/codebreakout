# CODEBREAKOUT

A multi-themed brick breaker game built with vanilla JavaScript. Choose between programming languages (CODE), desserts (CAKE), or space exploration (ASTRO) themes while progressing through increasingly difficult levels.

Created by [Rocco Milluzzo](https://www.linkedin.com/in/roccomilluzzo/)

🎮 **[Play Now](https://codebreakout.com)** | 🇮🇹 Supports English and Italian

## Quick Start

```bash
docker compose up -d
# Visit http://localhost:3000
```

## How to Play

### Objective
Break all the bricks by bouncing the ball off your paddle. Don't let the ball fall below the paddle or you'll lose a life. Complete all levels to win!

### Controls

| Input | Action |
|-------|--------|
| **Mouse** | Move paddle left/right |
| **Click** | Launch ball / Fire laser |
| **Arrow Keys / A,D** | Move paddle |
| **Space** | Launch ball / Fire laser |
| **Escape / P** | Pause game |
| **Touch (mobile)** | Drag to move, tap to launch |

### Scoring System

- **Base Points**: Each brick gives points based on type
- **Combo Multiplier**: Hit bricks quickly without missing to build combos (up to 5x)
- **Perfect Level Bonus**: Complete a level without losing lives for bonus points
- **Speed Bonus**: Complete levels faster for higher scores

### Brick Types

| Brick | Hits | Description |
|-------|------|-------------|
| 🟩 Standard | 1 | Basic brick |
| 🟦 Strong | 2 | Takes 2 hits, shows cracks |
| 🟪 Tough | 3 | Takes 3 hits, metallic look |
| ⬛ Unbreakable | ∞ | Cannot be destroyed |
| 🟥 Hazard | 1 | Lose a life if hit! |
| 🟧 Exploding | 1 | Destroys nearby bricks |
| 🟣 Portal | 1 | Teleports the ball |

### Powerups

Collect powerups that fall from broken bricks:

**Positive (Green border)**
| Powerup | Effect |
|---------|--------|
| ⊕ Multiball | Splits ball into 3 |
| ↔ Wide Paddle | Increases paddle width |
| ◷ Slow-Mo | Slows ball speed |
| ⚡ Laser | Fire lasers from paddle |
| ═ Shield | Bottom barrier saves one ball |
| ⊙ Magnet | Ball sticks to paddle |
| 🔥 Fireball | Ball destroys all bricks in path |

**Negative (Red border)**
| Powerup | Effect |
|---------|--------|
| ↔ Mini Paddle | Shrinks paddle |
| ⚡ Fast Ball | Increases ball speed |
| ⌀ Glitch | Ball becomes invisible |

## Game Modes

### Campaign Mode (Recommended)
Progress through all levels including bonus stages. Your progress is saved automatically.

### Classic Mode
Play through the main levels without bonus stages. Pure brick-breaking action.

### Easy Mode
Same levels but with more lives and slower ball speed. Great for beginners.

### Bonus Mode
Jump directly to any bonus stage you've unlocked.

## Themes

Click the title prefix (CODE/CAKE/ASTRO) to switch themes:

| Theme | Style | Levels Progress |
|-------|-------|-----------------|
| **CODE** | Programming languages | HTML → Assembly |
| **CAKE** | Desserts | Cupcake → Wedding Cake |
| **ASTRO** | Space exploration | Moon → Big Bang |

Each theme has unique visuals but identical gameplay mechanics.

## Levels

### Main Levels (15)

| # | CODE | CAKE | ASTRO | Special Mechanic |
|---|------|------|-------|------------------|
| 1 | HTML | Cupcake | Moon | Basic bricks |
| 2 | CSS | Cookie | Mars | 2-hit bricks |
| 3 | JavaScript | Muffin | Saturn | Random powerups |
| 4 | Python | Brownie | Jupiter | Curved patterns |
| 5 | PHP | Donut | Neptune | Speed focus |
| 6 | Ruby | Macaron | Venus | Combo focused |
| 7 | Java | Cheesecake | Mercury | Heavy bricks + hazards |
| 8 | C# | Eclair | Pluto | Multi-ball spawns |
| 9 | TypeScript | Croissant | Asteroid Belt | Penalty for missed powerups |
| 10 | C | Tiramisu | Sun | Faster ball, smaller paddle |
| 11 | C++ | Souffle | Black Hole | Moving bricks |
| 12 | Go | Creme Brulee | Pulsar | Split-ball mechanics |
| 13 | Rust | Profiterole | Quasar | Limited boosts |
| 14 | Haskell | Baklava | Nebula | Portal bricks |
| 15 | Assembly | Wedding Cake | Big Bang | Maximum difficulty |

### Bonus Stages (8)

| Stage | Description | How to Win |
|-------|-------------|------------|
| **Roguelike** | Endless brick regeneration | Survive 2:30 |
| **Zen Mode** | Permanent shield, no stress | Rack up points! |
| **Bounce** | Doodle Jump-style platforming | Keep jumping higher |
| **Bullet Hell** | Dodge enemy projectiles | Survive and break bricks |
| **Invasion** | Bricks descend from above | Don't let them reach bottom |
| **Multiball Madness** | Ball multiplication chaos | Reach 50 balls on screen |
| **Boss Battle** | Face a boss enemy | Hit weak points to defeat |
| **Speed Run** | Timed wave clearing | Clear all waves in 60 seconds |

## Achievements (26)

Track your progress with 26 achievements:

- **First Blood** - Complete your first level
- **Combo Master** - Reach 5x multiplier
- **Unstoppable** - Reach 10x multiplier
- **Flawless** - Complete a level without losing lives
- **Speed Demon** - Complete a level in under 30 seconds
- **Chaos Lord** - Have 20+ balls at once
- **Rising Star** - Reach 10,000 total score
- **Legend** - Reach 100,000 total score
- **Score Titan** - Reach 500,000 total score
- ...and many more!

## Customization

Unlock cosmetic items by playing:

- **Paddle Skins**: Default, Neon, Gold, Fire, Pixel, Rainbow
- **Ball Trails**: Default, Neon, Fire, Ice, Rainbow
- **Backgrounds**: Default, Matrix, Nebula, Retro

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    Backend API  │────▶│   PostgreSQL    │
│    (nginx)      │     │  (Node/Express) │     │    Database     │
│   :3000/80      │     │     :3001       │     │     :5432       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

The game runs as a containerized stack:
- **Frontend**: Static files served by nginx with API proxy
- **Backend**: Node.js/Express REST API for high score persistence
- **Database**: PostgreSQL for persistent leaderboard storage

## Features

- 🎮 15 themed levels + 8 bonus stages
- 🎨 3 visual themes (CODE/CAKE/ASTRO)
- 🌍 Multilingual (English/Italian)
- 🏆 26 achievements to unlock
- 👗 Cosmetic customization system
- 💾 Cloud leaderboard with PostgreSQL
- 📊 Anonymous statistics dashboard
- 🔊 Procedural synthwave music
- 📱 Mobile and desktop support
- 🎯 Easter egg quotes at high combos
- ⚡ Special attacks (Kamehameha, Hadouken)

## Tech Stack

- **Frontend**: Vanilla JavaScript ES6 modules, HTML5 Canvas, CSS3 Animations
- **Audio**: Web Audio API for procedural sound effects and music
- **Backend**: Node.js + Express REST API
- **Database**: PostgreSQL 16
- **Deployment**: Docker Compose with nginx reverse proxy

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/scores` | Get top 10 scores |
| POST | `/api/scores` | Submit new score |
| GET | `/api/scores/top` | Get highest score |
| GET | `/api/scores/check/:score` | Check if score qualifies |
| GET | `/api/stats` | Get aggregate anonymous statistics |
| POST | `/api/stats` | Record anonymous game session |

## Development

### Local Development (without Docker)

```bash
# Start database
docker compose up -d db

# Start backend
cd backend && npm install && npm run dev

# Serve frontend
python3 -m http.server 8080
```

### Running Tests

```bash
npm install
npm test
```

### Project Structure

```
├── index.html          # Game HTML
├── styles.css          # All styling
├── src/
│   ├── main.js         # Game class and loop
│   ├── config.js       # Game constants
│   ├── levels.js       # Level definitions
│   ├── themes.js       # Theme definitions (CODE/CAKE/ASTRO)
│   ├── achievements.js # Achievement system
│   ├── cosmetics.js    # Customization items
│   ├── i18n.js         # Internationalization (EN/IT)
│   ├── easterEggs.js   # Combo quotes and special attacks
│   ├── entities/       # Paddle, ball, brick, powerup
│   └── systems/        # Input, collision, render, audio, storage, theme
├── tests/              # Vitest unit tests
├── backend/
│   ├── server.js       # Express API server
│   └── Dockerfile      # API container
├── db/
│   └── init.sql        # Database schema
├── nginx.conf          # Reverse proxy config
├── Dockerfile          # Frontend container
└── docker-compose.yml  # Full stack orchestration
```

## Mobile Apps

The game can be built for iOS and Android using Capacitor:

```bash
# Build web assets
cp index.html styles.css www/
cp -r src www/

# iOS
npx cap sync ios
npx cap open ios

# Android
npx cap sync android
npx cap open android
```

## License

MIT
