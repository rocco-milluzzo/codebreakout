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
