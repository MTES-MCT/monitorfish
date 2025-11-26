ALTER TABLE
    public.risk_factors
ADD COLUMN
    last_control_infractions JSONB;

UPDATE
    public.risk_factors
SET
    last_control_infractions = CASE WHEN jsonb_typeof(last_control_logbook_infractions) = 'array' THEN last_control_logbook_infractions ELSE '[]' END ||
                  CASE WHEN jsonb_typeof(last_control_gear_infractions) = 'array' THEN last_control_gear_infractions ELSE '[]' END ||
                  CASE WHEN jsonb_typeof(last_control_species_infractions) = 'array' THEN last_control_species_infractions ELSE '[]' END ||
                  CASE WHEN jsonb_typeof(last_control_other_infractions) = 'array' THEN last_control_other_infractions ELSE '[]' END;

ALTER TABLE
    public.risk_factors
DROP COLUMN last_control_logbook_infractions,
DROP COLUMN last_control_gear_infractions,
DROP COLUMN last_control_species_infractions,
DROP COLUMN last_control_other_infractions;
