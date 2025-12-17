-- Migration: Add source_handle and target_handle columns to edges table
-- These columns store which specific handle (Top/Bottom/Left/Right) each edge connects to
-- IMPORTANT: Run this in Supabase SQL Editor

-- Add source_handle column
ALTER TABLE edges ADD COLUMN IF NOT EXISTS source_handle text;

-- Add target_handle column  
ALTER TABLE edges ADD COLUMN IF NOT EXISTS target_handle text;

-- Optional: Add comment for documentation
COMMENT ON COLUMN edges.source_handle IS 'React Flow handle ID on the source node (e.g., "node-id-right")';
COMMENT ON COLUMN edges.target_handle IS 'React Flow handle ID on the target node (e.g., "node-id-left")';
