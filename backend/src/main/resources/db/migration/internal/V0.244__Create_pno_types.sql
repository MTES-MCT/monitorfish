CREATE TABLE IF NOT EXISTS pno_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    minimum_notification_period DOUBLE PRECISION NOT NULL DEFAULT -1,
    has_designated_ports BOOLEAN NOT NULL DEFAULT False
);

CREATE TABLE IF NOT EXISTS pno_type_rules (
    id SERIAL PRIMARY KEY,
    pno_type_id INTEGER NOT NULL REFERENCES pno_types (id),
    species VARCHAR[] NOT NULL DEFAULT '{}'::VARCHAR[],
    fao_areas VARCHAR[] NOT NULL DEFAULT '{}'::VARCHAR[],
    cgpm_areas VARCHAR[] NOT NULL DEFAULT '{}'::VARCHAR[],
    gears VARCHAR[] NOT NULL DEFAULT '{}'::VARCHAR[],
    flag_states VARCHAR[] NOT NULL DEFAULT '{}'::VARCHAR[],
    minimum_quantity_kg DOUBLE PRECISION NOT NULL DEFAULT 0
);
