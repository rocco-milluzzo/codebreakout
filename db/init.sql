-- CODEBREAKOUT Database Initialization
-- ============================================================================

-- Create high_scores table
CREATE TABLE IF NOT EXISTS high_scores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL DEFAULT 'Anonymous',
    score INTEGER NOT NULL,
    level VARCHAR(50) NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster score queries
CREATE INDEX IF NOT EXISTS idx_high_scores_score ON high_scores (score DESC);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE high_scores TO codebreakout;
GRANT USAGE, SELECT ON SEQUENCE high_scores_id_seq TO codebreakout;

-- ============================================================================
-- ANONYMOUS GAME STATISTICS
-- ============================================================================

-- Create game_stats table for anonymous statistics
CREATE TABLE IF NOT EXISTS game_stats (
    id SERIAL PRIMARY KEY,
    mode VARCHAR(20) NOT NULL,
    level_reached VARCHAR(50) NOT NULL,
    play_time_seconds INTEGER NOT NULL DEFAULT 0,
    score INTEGER NOT NULL DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster statistics queries
CREATE INDEX IF NOT EXISTS idx_game_stats_date ON game_stats (date DESC);
CREATE INDEX IF NOT EXISTS idx_game_stats_mode ON game_stats (mode);

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE game_stats TO codebreakout;
GRANT USAGE, SELECT ON SEQUENCE game_stats_id_seq TO codebreakout;
