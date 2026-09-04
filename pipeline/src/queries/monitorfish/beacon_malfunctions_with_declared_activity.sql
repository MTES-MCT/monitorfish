WITH current_malfunctions AS (
    SELECT
        id,
        internal_reference_number AS cfr,
        vessel_status_last_modification_date_utc,
        is_followed
    FROM beacon_malfunctions bm
    WHERE stage IN ('INITIAL_ENCOUNTER', 'AT_QUAY', 'FOLLOWING', 'TARGETING_VESSEL') AND internal_reference_number IS NOT NULL
),

latest_activities AS (
    SELECT
        cfr,
        MAX(activity_datetime_utc) AS latest_activity_datetime_utc
    FROM logbook_reports
    WHERE
        operation_datetime_utc >= :utcnow - INTERVAL '24h'
        AND operation_type = 'DAT'
        AND log_type IN ('DEP', 'FAR')
    GROUP BY cfr
)

SELECT
    cm.id,
    is_followed
FROM latest_activities la
JOIN current_malfunctions cm
ON la.cfr = cm.cfr
WHERE latest_activity_datetime_utc > cm.vessel_status_last_modification_date_utc