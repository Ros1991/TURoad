-- Migration: Create user_favorite_events table
-- Date: 2025-08-26
-- Description: Create table to store user favorite events, following the same pattern as user_favorite_cities

CREATE TABLE IF NOT EXISTS user_favorite_events (
    user_favorite_event_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_user_favorite_events_user_id 
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_favorite_events_event_id 
        FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate favorites
    CONSTRAINT uk_user_favorite_events_user_event 
        UNIQUE (user_id, event_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorite_events_user_id ON user_favorite_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_events_event_id ON user_favorite_events(event_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_events_created_at ON user_favorite_events(created_at);

-- Add comments
COMMENT ON TABLE user_favorite_events IS 'Stores user favorite events relationships';
COMMENT ON COLUMN user_favorite_events.user_favorite_event_id IS 'Primary key';
COMMENT ON COLUMN user_favorite_events.user_id IS 'Reference to users table';
COMMENT ON COLUMN user_favorite_events.event_id IS 'Reference to events table';
COMMENT ON COLUMN user_favorite_events.created_at IS 'Timestamp when the favorite was added';
COMMENT ON COLUMN user_favorite_events.updated_at IS 'Timestamp when the favorite was last updated';
