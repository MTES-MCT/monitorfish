-- Add controllers table

CREATE TABLE IF NOT EXISTS public.controllers(
    id INTEGER,
    controller CHARACTER VARYING(50),
    controller_type CHARACTER VARYING(10),
    administration CHARACTER VARYING(50)
);

CREATE INDEX ON public.controllers (id);

-- Add infractions table

CREATE TABLE IF NOT EXISTS public.infractions(
    id INTEGER PRIMARY KEY,
    natinf_code CHARACTER VARYING(20),
    regulation CHARACTER VARYING(100),
    infraction_category CHARACTER VARYING(50),
    infraction TEXT
    );

CREATE INDEX ON public.infractions (id);

-- Add controls table

CREATE TABLE IF NOT EXISTS public.controls (
    id INTEGER PRIMARY KEY,
    vessel_id INTEGER,
    controller_id INTEGER,
    control_type CHARACTER VARYING(100),
    control_datetime_utc TIMESTAMP,
    input_start_datetime_utc TIMESTAMP,
    input_end_datetime_utc TIMESTAMP,
    facade CHARACTER VARYING(100),
    longitude DOUBLE PRECISION,
    latitude DOUBLE PRECISION,
    port_locode CHARACTER VARYING(5),
    mission_order BOOLEAN,
    vessel_targeted BOOLEAN,
    cnsp_called_unit BOOLEAN,
    cooperative BOOLEAN,
    pre_control_comments TEXT,
    infraction BOOLEAN,
    infraction_ids INTEGER[],
    diversion BOOLEAN,
    escort_to_quay BOOLEAN,
    seizure BOOLEAN,
    seizure_comments TEXT,
    post_control_comments TEXT,
    gear_controls JSONB
);

CREATE INDEX ON public.controls (id);
CREATE INDEX ON public.controls (vessel_id, control_datetime_utc DESC);
CREATE INDEX ON public.controls (controller_id, control_datetime_utc DESC);

