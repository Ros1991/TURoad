-- Migration: Create user_favorite_locations table
-- Date: 2025-08-26
-- Description: Create table to store user favorite locations, following the same pattern as user_favorite_cities

CREATE TABLE IF NOT EXISTS user_favorite_locations (
    user_favorite_location_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    location_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraints
    CONSTRAINT fk_user_favorite_locations_user_id 
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_user_favorite_locations_location_id 
        FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE CASCADE,
    
    -- Unique constraint to prevent duplicate favorites
    CONSTRAINT uk_user_favorite_locations_user_location 
        UNIQUE (user_id, location_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_favorite_locations_user_id ON user_favorite_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_locations_location_id ON user_favorite_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_user_favorite_locations_created_at ON user_favorite_locations(created_at);

-- Add comments
COMMENT ON TABLE user_favorite_locations IS 'Stores user favorite locations relationships';
COMMENT ON COLUMN user_favorite_locations.user_favorite_location_id IS 'Primary key';
COMMENT ON COLUMN user_favorite_locations.user_id IS 'Reference to users table';
COMMENT ON COLUMN user_favorite_locations.location_id IS 'Reference to locations table';
COMMENT ON COLUMN user_favorite_locations.created_at IS 'Timestamp when the favorite was added';
COMMENT ON COLUMN user_favorite_locations.updated_at IS 'Timestamp when the favorite was last updated';
