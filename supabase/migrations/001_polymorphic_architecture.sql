-- ============================================================================
-- MINDO 2.0 - MIGRATION SCRIPT: Polymorphic Architecture
-- ============================================================================
-- Run this INSTEAD of schema.sql if you already have existing tables.
-- This script safely migrates your existing data to the new JSONB structure.
-- ============================================================================

-- ============================================================================
-- STEP 1: Migrate NODES table
-- ============================================================================

-- 1.1 Add new JSONB columns
ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS position jsonb;
ALTER TABLE public.nodes ADD COLUMN IF NOT EXISTS data jsonb;

-- 1.2 Migrate existing data to new columns
UPDATE public.nodes 
SET position = jsonb_build_object('x', COALESCE(position_x, 0), 'y', COALESCE(position_y, 0))
WHERE position IS NULL;

UPDATE public.nodes 
SET data = jsonb_build_object('content', COALESCE(content, ''))
WHERE data IS NULL;

-- 1.3 Set defaults for new columns
ALTER TABLE public.nodes ALTER COLUMN position SET DEFAULT '{"x": 0, "y": 0}'::jsonb;
ALTER TABLE public.nodes ALTER COLUMN data SET DEFAULT '{}'::jsonb;

-- 1.4 Make position NOT NULL (after migration)
ALTER TABLE public.nodes ALTER COLUMN position SET NOT NULL;
ALTER TABLE public.nodes ALTER COLUMN data SET NOT NULL;

-- 1.5 Update type constraint to support new node types
-- First, drop the old constraint if it exists
ALTER TABLE public.nodes DROP CONSTRAINT IF EXISTS nodes_type_check;

-- Create new constraint with all 5 types
ALTER TABLE public.nodes ADD CONSTRAINT nodes_type_check 
  CHECK (type IN ('text', 'code', 'video', 'image', 'pdf'));

-- 1.6 Update status constraint
ALTER TABLE public.nodes DROP CONSTRAINT IF EXISTS nodes_status_check;
ALTER TABLE public.nodes ADD CONSTRAINT nodes_status_check 
  CHECK (status IN ('new', 'learning', 'review_due', 'mastered', 'inbox'));

-- 1.7 Add GIN indexes for JSONB queries (if not exist)
CREATE INDEX IF NOT EXISTS nodes_data_gin_idx ON public.nodes USING gin(data);
CREATE INDEX IF NOT EXISTS nodes_position_gin_idx ON public.nodes USING gin(position);

-- ============================================================================
-- STEP 2: Migrate MEMORY_UNITS table
-- ============================================================================

-- 2.1 Add new JSONB anchor column
ALTER TABLE public.memory_units ADD COLUMN IF NOT EXISTS anchor jsonb;

-- 2.2 Add next_review column if missing
ALTER TABLE public.memory_units ADD COLUMN IF NOT EXISTS next_review timestamp with time zone;

-- 2.3 Rename question/answer to front/back (if columns exist)
-- Note: This is optional - you can keep the old names if your API expects them
DO $$
BEGIN
  -- Check if 'question' column exists and 'front' doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'memory_units' AND column_name = 'question')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'memory_units' AND column_name = 'front')
  THEN
    ALTER TABLE public.memory_units RENAME COLUMN question TO front;
  END IF;
  
  -- Check if 'answer' column exists and 'back' doesn't
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name = 'memory_units' AND column_name = 'answer')
     AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                     WHERE table_name = 'memory_units' AND column_name = 'back')
  THEN
    ALTER TABLE public.memory_units RENAME COLUMN answer TO back;
  END IF;
END $$;

-- 2.4 Migrate text_segment to anchor JSONB
UPDATE public.memory_units 
SET anchor = jsonb_build_object('segment', text_segment)
WHERE text_segment IS NOT NULL AND anchor IS NULL;

-- 2.5 Add GIN index for anchor
CREATE INDEX IF NOT EXISTS memory_units_anchor_gin_idx ON public.memory_units USING gin(anchor);

-- 2.6 Add trigger for updated_at if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'handle_updated_at_memory_units') THEN
    CREATE TRIGGER handle_updated_at_memory_units
      BEFORE UPDATE ON public.memory_units
      FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
  END IF;
END $$;

-- ============================================================================
-- STEP 3: Add indexes for performance (if not exist)
-- ============================================================================
CREATE INDEX IF NOT EXISTS nodes_user_id_idx ON public.nodes(user_id);
CREATE INDEX IF NOT EXISTS nodes_type_idx ON public.nodes(type);
CREATE INDEX IF NOT EXISTS nodes_status_idx ON public.nodes(status);
CREATE INDEX IF NOT EXISTS edges_user_id_idx ON public.edges(user_id);
CREATE INDEX IF NOT EXISTS edges_source_id_idx ON public.edges(source_id);
CREATE INDEX IF NOT EXISTS edges_target_id_idx ON public.edges(target_id);
CREATE INDEX IF NOT EXISTS memory_units_user_id_idx ON public.memory_units(user_id);
CREATE INDEX IF NOT EXISTS memory_units_node_id_idx ON public.memory_units(node_id);
CREATE INDEX IF NOT EXISTS memory_units_next_review_idx ON public.memory_units(next_review);

-- ============================================================================
-- STEP 4 (OPTIONAL): Drop old columns after confirming migration
-- ============================================================================
-- UNCOMMENT THESE LINES ONLY AFTER VERIFYING YOUR DATA MIGRATED CORRECTLY!
-- 
-- ALTER TABLE public.nodes DROP COLUMN IF EXISTS position_x;
-- ALTER TABLE public.nodes DROP COLUMN IF EXISTS position_y;
-- ALTER TABLE public.nodes DROP COLUMN IF EXISTS content;
-- ALTER TABLE public.memory_units DROP COLUMN IF EXISTS text_segment;

-- ============================================================================
-- MIGRATION COMPLETE!
-- ============================================================================
-- Your database now supports the polymorphic architecture:
-- - nodes.position: JSONB {"x": 0, "y": 0}
-- - nodes.data: JSONB with type-specific fields
-- - nodes.type: 'text' | 'code' | 'video' | 'image' | 'pdf'
-- - memory_units.anchor: JSONB for precise locations
-- ============================================================================
