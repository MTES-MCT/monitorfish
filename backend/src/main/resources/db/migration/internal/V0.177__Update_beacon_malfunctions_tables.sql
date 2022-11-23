WITH deleted_malfunctions AS (
    DELETE FROM beacon_malfunctions
    WHERE malfunction_start_date_utc < TO_DATE('20221021', 'YYYYMMDD')
    RETURNING id
),

deleted_actions AS (
    DELETE FROM beacon_malfunction_actions ba
    USING deleted_malfunctions
    WHERE ba.beacon_malfunction_id = deleted_malfunctions.id
),

deleted_comments AS (
    DELETE FROM beacon_malfunction_comments bc
    USING deleted_malfunctions
    WHERE bc.beacon_malfunction_id = deleted_malfunctions.id
)

DELETE FROM beacon_malfunction_notifications bn
USING deleted_malfunctions
WHERE bn.beacon_malfunction_id = deleted_malfunctions.id;
