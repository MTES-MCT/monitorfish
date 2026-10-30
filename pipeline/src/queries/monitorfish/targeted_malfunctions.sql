WITH targeted_malfunctions AS (
    SELECT
        bm.internal_reference_number AS cfr,
        bm.id,
        MAX(bma.date_time_utc) AS targeting_datetime_utc
    FROM beacon_malfunction_actions bma
    JOIN beacon_malfunctions bm
    ON bm.id = bma.beacon_malfunction_id
    WHERE
        property_name = 'STAGE' AND
        next_value = 'TARGETING_VESSEL' AND
        date_time_utc >= :from_datetime_utc
    GROUP BY 1, 2
)

SELECT
    cfr,
    COUNT(*) AS occurrences,
    ARRAY_AGG(id ORDER BY targeting_datetime_utc DESC) AS beacon_malfunction_ids
FROM targeted_malfunctions
GROUP BY 1
ORDER BY 2 DESC