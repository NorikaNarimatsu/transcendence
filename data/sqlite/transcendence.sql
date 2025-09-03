-- Create the players table
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT OR IGNORE INTO players (username) VALUES 
    ('alice'),
    ('bob'),
    ('charlie'),
    ('diana'),
    ('player1'),
    ('testuser');

-- Create a games table for testing relationships
CREATE TABLE IF NOT EXISTS games (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player1_id INTEGER NOT NULL,
    player2_id INTEGER NOT NULL,
    player1_score INTEGER DEFAULT 0,
    player2_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player1_id) REFERENCES players(id),
    FOREIGN KEY (player2_id) REFERENCES players(id)
);

-- Insert some sample games
INSERT OR IGNORE INTO games (player1_id, player2_id, player1_score, player2_score) VALUES 
    (1, 2, 11, 9),   -- alice vs bob
    (3, 4, 11, 7),   -- charlie vs diana
    (1, 3, 8, 11),   -- alice vs charlie
    (2, 4, 11, 11);  -- bob vs diana (tie)