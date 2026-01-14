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
