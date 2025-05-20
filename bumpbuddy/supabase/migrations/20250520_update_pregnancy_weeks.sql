-- Add a reference from pregnancy_weeks to fetal_size_comparisons
ALTER TABLE pregnancy_weeks
ADD COLUMN fetal_size_week INTEGER REFERENCES fetal_size_comparisons(week);

-- Update all existing rows to have the corresponding fetal size week
UPDATE pregnancy_weeks
SET fetal_size_week = week
WHERE week BETWEEN 5 AND 40;

-- Add a comment to document the relationship
COMMENT ON COLUMN pregnancy_weeks.fetal_size_week IS 'Reference to the fetal_size_comparisons table for size visualization'; 