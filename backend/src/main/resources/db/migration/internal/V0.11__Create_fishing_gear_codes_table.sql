CREATE TABLE  if not exists public.fishing_gear_codes (
    fishing_gear_code character varying(100) NOT NULL,
    fishing_gear character varying(200),
    fishing_gear_category character varying(200)
);

ALTER TABLE public.fishing_gear_codes DROP CONSTRAINT IF EXISTS fishing_gear_codes_pkey;
ALTER TABLE ONLY public.fishing_gear_codes ADD CONSTRAINT fishing_gear_codes_pkey PRIMARY KEY (fishing_gear_code);
