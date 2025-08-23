-- Script SQL para alterar campo event_time para time_text_ref_id
-- Execute este script diretamente no PostgreSQL

BEGIN;

-- Verifica estrutura atual
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Remove a coluna event_time se existir
ALTER TABLE events DROP COLUMN IF EXISTS event_time;

-- Adiciona a nova coluna time_text_ref_id
ALTER TABLE events ADD COLUMN IF NOT EXISTS time_text_ref_id INTEGER;

-- Adiciona foreign key constraint se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'FK_events_time_text_ref_id'
    ) THEN
        ALTER TABLE events 
        ADD CONSTRAINT FK_events_time_text_ref_id 
        FOREIGN KEY (time_text_ref_id) 
        REFERENCES localized_texts(text_ref_id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Registra a migration como executada
INSERT INTO migrations (timestamp, name) 
VALUES (1724348933000, 'AlterEventTimeToTranslatable1724348933000')
ON CONFLICT DO NOTHING;

-- Verifica estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'events' AND table_schema = 'public'
ORDER BY ordinal_position;

COMMIT;
