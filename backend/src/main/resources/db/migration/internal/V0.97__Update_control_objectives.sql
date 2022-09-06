ALTER TABLE public.control_objectives
    ADD COLUMN id serial;

BEGIN;
ALTER TABLE control_objectives
    DROP CONSTRAINT facade_segment_year_pkey;
ALTER TABLE control_objectives
    ADD CONSTRAINT facade_segment_year_unique UNIQUE (facade, segment, year);
COMMIT;
