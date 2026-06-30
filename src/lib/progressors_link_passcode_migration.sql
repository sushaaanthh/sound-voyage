-- Task 1: Database Migration
-- Add link_passcode column to progressors table
ALTER TABLE progressors 
ADD COLUMN IF NOT EXISTS link_passcode TEXT NOT NULL DEFAULT '';
