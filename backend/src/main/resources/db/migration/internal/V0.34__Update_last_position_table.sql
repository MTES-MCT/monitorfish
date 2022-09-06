DELETE
from public.last_positions;

ALTER TABLE public.last_positions
    ADD COLUMN id integer NOT NULL;
