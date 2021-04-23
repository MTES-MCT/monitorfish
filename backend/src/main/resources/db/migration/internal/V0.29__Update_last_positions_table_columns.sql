ALTER TABLE public.last_positions
    ALTER COLUMN latitude DROP NOT NULL;
ALTER TABLE public.last_positions
    ALTER COLUMN longitude DROP NOT NULL;
ALTER TABLE public.last_positions
    ALTER COLUMN speed DROP NOT NULL;