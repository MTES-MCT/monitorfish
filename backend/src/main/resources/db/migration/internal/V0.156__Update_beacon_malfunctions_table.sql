-- Remove malfunctions cards in stage END_OF_MALFUNCTION

UPDATE
    beacon_malfunctions
SET
    stage = CAST('ARCHIVED' AS beacon_malfunctions_stage), vessel_status_last_modification_date_utc = NOW()
WHERE
    stage = CAST('END_OF_MALFUNCTION' AS beacon_malfunctions_stage);

DO $$
    DECLARE beaconrow RECORD;
    BEGIN FOR beaconrow IN
        SELECT
            *
        FROM
            beacon_malfunctions
        WHERE
            stage = CAST('END_OF_MALFUNCTION' AS beacon_malfunctions_stage)
        LOOP
            INSERT INTO
                beacon_malfunction_actions (beacon_malfunction_id, property_name, previous_value, next_value, date_time_utc)
            VALUES
                (beaconrow.id, 'STAGE', 'END_OF_MALFUNCTION', 'ARCHIVED', NOW());
        END LOOP;
    END $$;
