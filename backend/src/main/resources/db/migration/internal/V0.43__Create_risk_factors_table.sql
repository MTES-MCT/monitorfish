CREATE TABLE IF NOT EXISTS risk_factors
(
    cfr                       VARCHAR(100),
    ircs                      VARCHAR(100),
    external_immatriculation  VARCHAR(100),
    last_ers_datetime_utc     TIMESTAMP,
    departure_datetime_utc    TIMESTAMP,
    trip_number               DOUBLE PRECISION,
    gear_onboard              JSONB,
    species_onboard           JSONB,
    segments                  varchar(100)[],
    total_weight_onboard      DOUBLE PRECISION,
    last_control_datetime_utc TIMESTAMP,
    last_control_infraction   BOOLEAN,
    post_control_comments     TEXT,
    impact_risk_factor        DOUBLE PRECISION,
    probability_risk_factor   DOUBLE PRECISION,
    detectability_risk_factor DOUBLE PRECISION,
    risk_factor               DOUBLE PRECISION
);

CREATE INDEX ON public.risk_factors (cfr);
CREATE INDEX ON public.risk_factors (ircs);
CREATE INDEX ON public.risk_factors (external_immatriculation);
