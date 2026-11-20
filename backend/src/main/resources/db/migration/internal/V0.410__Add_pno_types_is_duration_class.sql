-- `true` for the PNO types that only describe the duration class of the trip (ex: "Marée < 24h")
ALTER TABLE public.pno_types
    ADD COLUMN is_duration_class BOOLEAN NOT NULL DEFAULT FALSE;
