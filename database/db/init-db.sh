#!/bin/sh

# Create database if it doesn't exist
if [ ! -f /db/transcendence.db ]; then
    echo "Initializing database..."
    sqlite3 /db/transcendence.db < /db/transcendence.sql
    echo "Database initialized."
    
    echo "Sample data loaded. Current players:"
    sqlite3 /db/transcendence.db "SELECT id, username, datetime(created_at, 'localtime') as created_at FROM players;"
    
    echo "\nTotal players in database:"
    sqlite3 /db/transcendence.db "SELECT COUNT(*) as count FROM players;"
else
    echo "Database already exists."
    echo "Current players:"
    sqlite3 /db/transcendence.db "SELECT id, username, datetime(created_at, 'localtime') as created_at FROM players;"
fi

# Keep container running
tail -f /dev/null


##############################################################################################################

# # View all players
# docker exec sqlite sqlite3 /db/transcendence.db "SELECT * FROM players;"

# # Pretty formatted view with headers
# docker exec sqlite sqlite3 /db/transcendence.db ".mode column" ".headers on" "SELECT * FROM players;"

# # Count players
# docker exec sqlite sqlite3 /db/transcendence.db "SELECT COUNT(*) as total_players FROM players;"

##############################################################################################################

# # Enter the container
# docker exec -it sqlite sqlite3 /db/transcendence.db

# # Once inside SQLite:
# .mode column
# .headers on
# SELECT * FROM players;
# SELECT id, username, datetime(created_at, 'localtime') as joined_date FROM players;
# .exit