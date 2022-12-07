ALTER TABLE public.current_segments
  ADD COLUMN vessel_id integer,
  ADD COLUMN external_immatriculation varchar(100),
  ADD COLUMN ircs varchar(100);
