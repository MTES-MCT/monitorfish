ALTER TABLE fleet_segments
    ADD COLUMN year INTEGER;

UPDATE fleet_segments SET year = 2022 WHERE year IS NULL;

ALTER TABLE fleet_segments
    ALTER COLUMN year SET NOT NULL;

ALTER TABLE fleet_segments ADD CONSTRAINT fleet_segments_segment_year_unique UNIQUE (segment, year);
