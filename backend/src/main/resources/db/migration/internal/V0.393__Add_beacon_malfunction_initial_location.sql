-- Add initial_vessel_status and fill in legacy data
ALTER TABLE beacon_malfunctions
    ADD COLUMN initial_vessel_status beacon_malfunctions_vessel_status;

WITH initial_vessel_statuses_ AS (
    SELECT DISTINCT ON (beacon_malfunction_id) beacon_malfunction_id, previous_value::beacon_malfunctions_vessel_status AS initial_vessel_status
    FROM beacon_malfunction_actions
    WHERE property_name = 'VESSEL_STATUS'
    ORDER BY beacon_malfunction_id, date_time_utc
),

initial_vessel_statuses AS (
    SELECT
        bm.id,
        COALESCE(ivs.initial_vessel_status, bm.vessel_status) AS initial_vessel_status
    FROM beacon_malfunctions bm
    LEFT JOIN initial_vessel_statuses_ ivs
    ON bm.id = ivs.beacon_malfunction_id
)

UPDATE beacon_malfunctions bm
SET initial_vessel_status = ivs.initial_vessel_status
FROM initial_vessel_statuses ivs
WHERE ivs.id = bm.id;

ALTER TABLE beacon_malfunctions ALTER COLUMN initial_vessel_status SET NOT NULL;

-- Add creation_datetime_utc
ALTER TABLE beacon_malfunctions
ADD COLUMN creation_datetime_utc TIMESTAMP WITHOUT TIME ZONE;

UPDATE beacon_malfunctions
SET creation_datetime_utc = malfunction_start_date_utc + INTERVAL '4 hours'
WHERE initial_vessel_status = 'AT_SEA'::beacon_malfunctions_vessel_status;

UPDATE beacon_malfunctions
SET creation_datetime_utc = malfunction_start_date_utc + INTERVAL '60 hours'
WHERE initial_vessel_status = 'AT_PORT'::beacon_malfunctions_vessel_status;

ALTER TABLE beacon_malfunctions ALTER COLUMN creation_datetime_utc SET NOT NULL;

-- Add is_followed column
ALTER TABLE beacon_malfunctions
    ADD COLUMN is_followed BOOLEAN;

UPDATE beacon_malfunctions
SET is_followed = true
WHERE initial_vessel_status = 'AT_SEA'::beacon_malfunctions_vessel_status;

UPDATE beacon_malfunctions
SET is_followed = false
WHERE initial_vessel_status != 'AT_SEA'::beacon_malfunctions_vessel_status;

ALTER TABLE beacon_malfunctions
ALTER COLUMN is_followed SET NOT NULL;

-- Drop unused column
ALTER TABLE beacon_malfunctions
DROP COLUMN beacon_status_at_malfunction_creation;