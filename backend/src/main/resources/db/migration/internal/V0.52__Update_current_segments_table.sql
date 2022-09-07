ALTER TABLE public.current_segments
    ADD COLUMN segment_highest_impact VARCHAR(100),
    ADD COLUMN segment_highest_priority VARCHAR(100);