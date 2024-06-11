ALTER TABLE public.control_anteriority
    ADD COLUMN last_control_logbook_infractions jsonb,
    ADD COLUMN last_control_gear_infractions jsonb,
    ADD COLUMN last_control_species_infractions jsonb,
    ADD COLUMN last_control_other_infractions jsonb;