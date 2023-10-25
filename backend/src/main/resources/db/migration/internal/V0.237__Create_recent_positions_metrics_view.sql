CREATE VIEW public.recent_positions_metrics AS

    WITH reference_positions_per_hour_french_vessels AS (
        SELECT
            COUNT(*) / 24.0 AS reference_positions_per_hour_french_vessels
        FROM positions
        WHERE
            date_time >= CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '24 hours' AND
            date_time < CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AND
            flag_state = 'FR'
    ),

    last_hour_positions_french_vessels AS (
        SELECT
            COUNT(*) AS last_hour_positions_french_vessels
        FROM positions
        WHERE
            date_time >= CURRENT_TIMESTAMP AT TIME ZONE 'UTC' - INTERVAL '1 hour' AND
            date_time < CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AND
            flag_state = 'FR'
    ),

    t AS (
        SELECT
            (
                SELECT reference_positions_per_hour_french_vessels
                FROM reference_positions_per_hour_french_vessels
            )::DOUBLE PRECISION AS reference_positions_per_hour_french_vessels,
            (
                SELECT last_hour_positions_french_vessels
                FROM last_hour_positions_french_vessels
            )::INTEGER AS last_hour_positions_french_vessels,
            GREATEST(
                800,
                0.7 * (
                    SELECT reference_positions_per_hour_french_vessels
                    FROM reference_positions_per_hour_french_vessels
                )
            )::DOUBLE PRECISION AS threshold
    )

    SELECT
        1 AS id,
        *,
        last_hour_positions_french_vessels < threshold AS sudden_drop_of_positions_received
    FROM t
