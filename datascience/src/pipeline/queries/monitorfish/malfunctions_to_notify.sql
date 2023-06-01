WITH requested_notifications AS (
    SELECT
        bm.id AS beacon_malfunction_id,
        COALESCE(v.cfr, v.external_immatriculation, v.ircs) AS vessel_cfr_or_immat_or_ircs,
        bm.beacon_number,
        v.vessel_name,
        bm.malfunction_start_date_utc,
        bm.latitude AS last_position_latitude,
        bm.longitude AS last_position_longitude,
        bm.notification_requested AS notification_type,
        v.vessel_emails,
        v.vessel_mobile_phone,
        v.vessel_fax,
        v.operator_name,      
        v.operator_email,
        v.operator_mobile_phone, 
        v.operator_fax, 
        so.name AS satellite_operator,
        so.emails AS satellite_operator_emails,
        fmc.country_name AS foreign_fmc_name,
        fmc.email_addresses AS foreign_fmc_emails
    FROM beacon_malfunctions bm
    LEFT JOIN beacons b
    ON b.beacon_number = bm.beacon_number
    JOIN vessels v
    ON b.vessel_id = v.id
    LEFT JOIN satellite_operators so
    ON so.id = b.satellite_operator_id
    LEFT JOIN foreign_fmcs fmc
    ON fmc.country_code_iso3 = bm.requested_notification_foreign_fmc_code
    WHERE notification_requested IS NOT NULL
),

previously_sent_notifications AS (
    SELECT
        beacon_malfunction_id,
        MAX(date_time_utc) AS previous_notification_datetime_utc
    FROM beacon_malfunction_notifications
    WHERE beacon_malfunction_id IN (SELECT beacon_malfunction_id FROM requested_notifications)
    GROUP BY beacon_malfunction_id
)

SELECT
    rn.*,
    psn.previous_notification_datetime_utc
FROM requested_notifications rn
LEFT JOIN previously_sent_notifications psn
ON rn.beacon_malfunction_id = psn.beacon_malfunction_id
ORDER BY beacon_malfunction_id