# CODEBREAKOUT

A programming-themed brick breaker game built with vanilla JavaScript. Progress through 15 levels, each themed around a programming language from HTML to Assembly, with increasing difficulty.

## Quick Start

```bash
docker compose up -d
# Visit http://localhost:3000
```

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

## Controls

| Input | Action |
|-------|--------|
| Mouse | Move paddle |
| Mouse Click | Fire laser (with powerup) |
| Arrow Keys / A,D | Move paddle |
| Space | Launch ball / Fire laser |
| Escape | Pause |
| Touch (mobile) | Drag to move, tap to launch |

## Features

- 15 themed programming language levels (HTML to Assembly)
- Progressive difficulty curve
- 6 positive powerups: Multiball, Wide Paddle, Slow-Mo, Laser, Shield, Magnet
- 3 negative powerups: Mini Paddle, Fast Ball, Glitch
- Combo multiplier system (up to 3x)
- Persistent high scores with PostgreSQL database
- Global leaderboard accessible from main menu
- Mobile and desktop support
- Easter egg quotes and special attacks at high combos

## Levels

| # | Language | Mechanic |
|---|----------|----------|
| 1 | HTML | Simple static blocks |
| 2 | CSS | Layered bricks (2-hit) |
| 3 | JavaScript | Random powerups |
| 4 | Python | Curved patterns |
| 5 | PHP | Speed bonus focus |
| 6 | Ruby | Combo-focused |
| 7 | Java | Heavy bricks + hazards |
| 8 | C# | Multi-ball spawns |
| 9 | TypeScript | Penalty for missed powerups |
| 10 | C | Faster ball, smaller paddle |
| 11 | C++ | Moving bricks |
| 12 | Go | Split-ball mechanics |
| 13 | Rust | Limited boosts, punishing |
| 14 | Haskell | Portal bricks |
| 15 | Assembly | Maximum difficulty |

## Tech Stack

- **Frontend**: Vanilla JavaScript ES6 modules, HTML5 Canvas, CSS3 Animations
- **Audio**: Web Audio API for procedural sound effects
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

### Project Structure

```
├── index.html          # Game HTML
├── styles.css          # All styling
├── src/
│   ├── main.js         # Game class and loop
│   ├── config.js       # Game constants
│   ├── levels.js       # 15 level definitions
│   ├── entities/       # Paddle, ball, brick, powerup
│   └── systems/        # Input, collision, render, audio, storage
├── backend/
│   ├── server.js       # Express API server
│   ├── package.json    # Node dependencies
│   └── Dockerfile      # API container
├── db/
│   └── init.sql        # Database schema
├── nginx.conf          # Reverse proxy config
├── Dockerfile          # Frontend container
└── docker-compose.yml  # Full stack orchestration
```

## License

MIT
