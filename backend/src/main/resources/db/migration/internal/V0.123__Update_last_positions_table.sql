ALTER TABLE public.last_positions
    ADD COLUMN beacon_malfunction_id integer,
    ADD COLUMN is_manual BOOLEAN;

UPDATE public.last_positions
    SET is_manual = positions.is_manual
    FROM positions
    WHERE last_positions.id = positions.id;