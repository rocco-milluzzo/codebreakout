// CODEBREAKOUT - Backend API Server
// ============================================================================
// Express API for high score persistence with PostgreSQL
// ============================================================================

import express from 'express';
import cors from 'cors';
import pg from 'pg';

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Valid level names (must match frontend LEVELS array)
const VALID_LEVELS = [
    'HTML', 'CSS', 'JavaScript', 'Python', 'PHP', 'ROGUELIKE', 'Ruby', 'Java', 'C#',
    'TypeScript', 'C', 'ZEN MODE', 'C++', 'Go', 'Rust', 'Haskell', 'BOUNCE', 'Assembly'
];

// Valid game modes for separate leaderboards
const VALID_MODES = ['campaign', 'roguelike', 'relax', 'doodle'];

// Database connection
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'codebreakout',
    user: process.env.DB_USER || 'codebreakout',
    password: process.env.DB_PASSWORD || 'codebreakout',
});

// Middleware
app.use(cors({
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '1kb' }));

// Simple rate limiting (in-memory, resets on restart)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 30; // max requests per window

function rateLimit(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - RATE_LIMIT_WINDOW;

    if (!rateLimitMap.has(ip)) {
        rateLimitMap.set(ip, []);
    }

    const requests = rateLimitMap.get(ip).filter(time => time > windowStart);
    requests.push(now);
    rateLimitMap.set(ip, requests);

    if (requests.length > RATE_LIMIT_MAX) {
        return res.status(429).json({ error: 'Too many requests. Please wait.' });
    }

    next();
}

// Apply rate limiting to POST endpoints
app.use('/api/scores', rateLimit);

// Health check (both paths for flexibility)
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        console.error('Health check failed:', error.message);
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});

app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        console.error('Health check failed:', error.message);
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});

// ============================================================================
// HIGH SCORES API
// ============================================================================

const MAX_SCORES = 10;
const MAX_SCORE_VALUE = 999999999;

/**
 * GET /api/scores
 * Retrieve all high scores (top 10)
 * Query params: mode (optional) - 'campaign', 'roguelike', 'relax', 'doodle'
 */
app.get('/api/scores', async (req, res) => {
    try {
        const mode = req.query.mode || 'campaign';
        if (!VALID_MODES.includes(mode)) {
            return res.status(400).json({ error: 'Invalid mode' });
        }

        const result = await pool.query(
            'SELECT id, name, score, level, mode, date FROM high_scores WHERE mode = $1 ORDER BY score DESC LIMIT $2',
            [mode, MAX_SCORES]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching scores:', error.message);
        res.status(500).json({ error: 'Failed to fetch scores' });
    }
});

/**
 * POST /api/scores
 * Add a new high score
 * Body: { name: string, score: number, level: string, mode?: string }
 */
app.post('/api/scores', async (req, res) => {
    try {
        const { name, score, level, mode = 'campaign' } = req.body;

        // Validate score: must be finite number in valid range
        if (typeof score !== 'number' || !Number.isFinite(score) || score < 0 || score > MAX_SCORE_VALUE) {
            return res.status(400).json({ error: 'Invalid score: must be a number between 0 and 999999999' });
        }

        // Validate level: must be in allowed list
        if (!level || !VALID_LEVELS.includes(level)) {
            return res.status(400).json({ error: 'Invalid level' });
        }

        // Validate mode
        if (!VALID_MODES.includes(mode)) {
            return res.status(400).json({ error: 'Invalid mode' });
        }

        // Validate name
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Invalid name' });
        }

        // Sanitize name (max 20 chars, trim whitespace, alphanumeric + spaces only)
        const sanitizedName = String(name)
            .trim()
            .slice(0, 20)
            .replace(/[^a-zA-Z0-9 _-]/g, '')
            || 'Anonymous';

        // Insert new score
        const result = await pool.query(
            'INSERT INTO high_scores (name, score, level, mode, date) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, name, score, level, mode, date',
            [sanitizedName, Math.floor(score), level, mode]
        );

        // Clean up old scores for this mode (keep only top MAX_SCORES per mode)
        await pool.query(`
            DELETE FROM high_scores
            WHERE mode = $1 AND id NOT IN (
                SELECT id FROM high_scores WHERE mode = $1 ORDER BY score DESC LIMIT $2
            )
        `, [mode, MAX_SCORES]);

        // Return updated leaderboard for this mode
        const leaderboard = await pool.query(
            'SELECT id, name, score, level, mode, date FROM high_scores WHERE mode = $1 ORDER BY score DESC LIMIT $2',
            [mode, MAX_SCORES]
        );

        res.status(201).json({
            added: result.rows[0],
            leaderboard: leaderboard.rows
        });
    } catch (error) {
        console.error('Error adding score:', error.message);
        res.status(500).json({ error: 'Failed to add score' });
    }
});

/**
 * GET /api/scores/top
 * Get the top score value
 * Query params: mode (optional)
 */
app.get('/api/scores/top', async (req, res) => {
    try {
        const mode = req.query.mode || 'campaign';
        if (!VALID_MODES.includes(mode)) {
            return res.status(400).json({ error: 'Invalid mode' });
        }

        const result = await pool.query(
            'SELECT score FROM high_scores WHERE mode = $1 ORDER BY score DESC LIMIT 1',
            [mode]
        );
        const topScore = result.rows[0]?.score || 0;
        res.json({ topScore });
    } catch (error) {
        console.error('Error fetching top score:', error.message);
        res.status(500).json({ error: 'Failed to fetch top score' });
    }
});

/**
 * GET /api/scores/check/:score
 * Check if a score qualifies for the leaderboard
 * Query params: mode (optional)
 */
app.get('/api/scores/check/:score', async (req, res) => {
    try {
        const score = parseInt(req.params.score, 10);
        const mode = req.query.mode || 'campaign';

        if (!Number.isFinite(score) || score < 0) {
            return res.status(400).json({ error: 'Invalid score parameter' });
        }

        if (!VALID_MODES.includes(mode)) {
            return res.status(400).json({ error: 'Invalid mode' });
        }

        const countResult = await pool.query(
            'SELECT COUNT(*) as count FROM high_scores WHERE mode = $1',
            [mode]
        );
        const count = parseInt(countResult.rows[0].count, 10);

        if (count < MAX_SCORES) {
            return res.json({ qualifies: true });
        }

        const lowestResult = await pool.query(
            'SELECT score FROM high_scores WHERE mode = $1 ORDER BY score ASC LIMIT 1',
            [mode]
        );
        const lowestScore = lowestResult.rows[0]?.score || 0;

        res.json({ qualifies: score > lowestScore });
    } catch (error) {
        console.error('Error checking score:', error.message);
        res.status(500).json({ error: 'Failed to check score' });
    }
});

// NOTE: DELETE endpoint removed for security - use database admin tools if needed

// ============================================================================
// ANONYMOUS GAME STATISTICS API
// ============================================================================

/**
 * POST /api/stats
 * Record a game session (anonymous)
 * Body: { mode: string, levelReached: string, playTimeSeconds: number, score: number }
 */
app.post('/api/stats', async (req, res) => {
    try {
        const { mode, levelReached, playTimeSeconds, score } = req.body;

        // Validate mode
        const validModes = ['classic', 'campaign', 'easy', 'roguelike', 'zen', 'bounce', 'bullet', 'tower', 'madness', 'boss', 'speed'];
        if (!mode || !validModes.includes(mode)) {
            return res.status(400).json({ error: 'Invalid mode' });
        }

        // Validate levelReached
        if (!levelReached || typeof levelReached !== 'string') {
            return res.status(400).json({ error: 'Invalid level' });
        }

        // Validate playTimeSeconds
        const time = parseInt(playTimeSeconds, 10);
        if (!Number.isFinite(time) || time < 0 || time > 36000) { // max 10 hours
            return res.status(400).json({ error: 'Invalid play time' });
        }

        // Validate score
        const gameScore = parseInt(score, 10) || 0;
        if (gameScore < 0 || gameScore > MAX_SCORE_VALUE) {
            return res.status(400).json({ error: 'Invalid score' });
        }

        // Insert anonymous game record
        await pool.query(
            'INSERT INTO game_stats (mode, level_reached, play_time_seconds, score, date) VALUES ($1, $2, $3, $4, NOW())',
            [mode, levelReached.slice(0, 50), time, gameScore]
        );

        res.status(201).json({ success: true });
    } catch (error) {
        console.error('Error recording stats:', error.message);
        res.status(500).json({ error: 'Failed to record stats' });
    }
});

/**
 * GET /api/stats
 * Retrieve aggregate anonymous statistics
 */
app.get('/api/stats', async (req, res) => {
    try {
        // Total games all time
        const totalGamesResult = await pool.query('SELECT COUNT(*) as count FROM game_stats');
        const totalGames = parseInt(totalGamesResult.rows[0].count, 10);

        // Games today
        const todayGamesResult = await pool.query(
            "SELECT COUNT(*) as count FROM game_stats WHERE date >= CURRENT_DATE"
        );
        const gamesToday = parseInt(todayGamesResult.rows[0].count, 10);

        // Games this week
        const weekGamesResult = await pool.query(
            "SELECT COUNT(*) as count FROM game_stats WHERE date >= CURRENT_DATE - INTERVAL '6 days'"
        );
        const gamesThisWeek = parseInt(weekGamesResult.rows[0].count, 10);

        // Total play time (minutes)
        const totalTimeResult = await pool.query('SELECT COALESCE(SUM(play_time_seconds), 0) as total FROM game_stats');
        const totalPlayTimeMinutes = Math.round(parseInt(totalTimeResult.rows[0].total, 10) / 60);

        // Average score
        const avgScoreResult = await pool.query('SELECT COALESCE(AVG(score), 0) as avg FROM game_stats');
        const avgScore = Math.round(parseFloat(avgScoreResult.rows[0].avg));

        // High score (all time best from game_stats)
        const highScoreResult = await pool.query('SELECT COALESCE(MAX(score), 0) as max FROM game_stats');
        const highScore = parseInt(highScoreResult.rows[0].max, 10);

        // Unique players estimate (count distinct sessions per day, sum up)
        // Since we don't track users, estimate by counting games with different scores in short time windows
        const uniquePlayersResult = await pool.query(`
            SELECT COUNT(DISTINCT DATE_TRUNC('hour', date) || '-' || score % 1000) as estimate
            FROM game_stats
            WHERE date >= CURRENT_DATE - INTERVAL '30 days'
        `);
        const uniquePlayers = Math.min(parseInt(uniquePlayersResult.rows[0].estimate, 10), totalGames);

        // Games per mode
        const modeStatsResult = await pool.query(
            'SELECT mode, COUNT(*) as count FROM game_stats GROUP BY mode ORDER BY count DESC'
        );
        const gamesByMode = {};
        modeStatsResult.rows.forEach(row => {
            gamesByMode[row.mode] = parseInt(row.count, 10);
        });

        // Level reached distribution (top 10)
        const levelStatsResult = await pool.query(
            'SELECT level_reached, COUNT(*) as count FROM game_stats GROUP BY level_reached ORDER BY count DESC LIMIT 10'
        );
        const levelDistribution = {};
        levelStatsResult.rows.forEach(row => {
            levelDistribution[row.level_reached] = parseInt(row.count, 10);
        });

        // Weekly activity - games per day for last 7 days (array of counts, Mon-Sun)
        const dailyStatsResult = await pool.query(`
            SELECT DATE(date) as day, COUNT(*) as count
            FROM game_stats
            WHERE date >= CURRENT_DATE - INTERVAL '6 days'
            GROUP BY DATE(date)
            ORDER BY day ASC
        `);

        // Build weeklyActivity array (7 days, fill missing days with 0)
        const weeklyActivity = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = dailyStatsResult.rows.find(r => r.day.toISOString().split('T')[0] === dateStr);
            weeklyActivity.push(dayData ? parseInt(dayData.count, 10) : 0);
        }

        // Average play time per session (seconds)
        const avgTimeResult = await pool.query('SELECT COALESCE(AVG(play_time_seconds), 0) as avg FROM game_stats');
        const averageSessionSeconds = Math.round(parseFloat(avgTimeResult.rows[0].avg));

        res.json({
            totalGames,
            gamesToday,
            gamesThisWeek,
            totalPlayTimeMinutes,
            avgScore,
            highScore,
            uniquePlayers,
            averageSessionSeconds,
            gamesByMode,
            levelDistribution,
            weeklyActivity
        });
    } catch (error) {
        console.error('Error fetching stats:', error.message);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

async function initDatabase() {
    try {
        // Create table if not exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS high_scores (
                id SERIAL PRIMARY KEY,
                name VARCHAR(20) NOT NULL DEFAULT 'Anonymous',
                score INTEGER NOT NULL,
                level VARCHAR(50) NOT NULL,
                mode VARCHAR(20) NOT NULL DEFAULT 'campaign',
                date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Add mode column if it doesn't exist (for existing databases)
        await pool.query(`
            ALTER TABLE high_scores ADD COLUMN IF NOT EXISTS mode VARCHAR(20) NOT NULL DEFAULT 'campaign'
        `);

        // Create index for faster queries (includes mode for filtered queries)
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_high_scores_mode_score ON high_scores (mode, score DESC)
        `);

        // Create game_stats table for anonymous statistics
        await pool.query(`
            CREATE TABLE IF NOT EXISTS game_stats (
                id SERIAL PRIMARY KEY,
                mode VARCHAR(20) NOT NULL,
                level_reached VARCHAR(50) NOT NULL,
                play_time_seconds INTEGER NOT NULL DEFAULT 0,
                score INTEGER NOT NULL DEFAULT 0,
                date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create indexes for stats queries
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_game_stats_date ON game_stats (date DESC)
        `);
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_game_stats_mode ON game_stats (mode)
        `);

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization error:', error.message);
        throw error;
    }
}

// ============================================================================
// START SERVER
// ============================================================================

async function startServer() {
    let retries = 10;

    while (retries > 0) {
        try {
            await initDatabase();

            app.listen(PORT, '0.0.0.0', () => {
                console.log(`CODEBREAKOUT API running on port ${PORT}`);
                console.log(`CORS origin: ${FRONTEND_URL}`);
            });

            return;
        } catch (error) {
            retries--;
            console.log(`Database not ready, retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.error('Failed to connect to database after multiple attempts');
    process.exit(1);
}

startServer();
