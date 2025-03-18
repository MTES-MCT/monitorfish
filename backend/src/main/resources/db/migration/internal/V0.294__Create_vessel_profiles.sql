-- Vessel profiles including the share (by weight) of catches made per gear, species, fao area, segment, landing_port...
CREATE TABLE IF NOT EXISTS public.vessel_profiles (
    cfr VARCHAR NOT NULL,
    gears JSONB,
    species JSONB,
    fao_areas JSONB,
    segments JSONB,
    -- landing_ports JSONB,
    recent_gears JSONB,
    recent_species JSONB,
    recent_fao_areas JSONB,
    recent_segments JSONB
    -- recent_landing_ports JSONB,
    -- latest_landing_port VARCHAR,
    -- latest_landing_facade facade
);
