WITH activities AS (
    SELECT
        operation_datetime_utc,
        cfr,
        activity_datetime_utc,
        log_type,
        trip_number,
        trip_number_was_computed,
        report_id,
        flag_state
    FROM
        logbook_reports
    WHERE
        operation_datetime_utc >= NOW() - INTERVAL ':nb_days days' AND
        operation_datetime_utc < NOW() + INTERVAL '2 hours' AND
        log_type IS NOT NULL AND
        trip_number IS NOT NULL
),

dels_targeting_activities AS (
   -- A DEL message has no flag_state, which we need to acknowledge messages of non french vessels.
   -- So we use the flag_state of the deleted message.
   SELECT del.referenced_report_id, del.operation_number, activities.flag_state
   FROM logbook_reports del
   JOIN activities
   ON del.referenced_report_id = activities.report_id
   WHERE
        del.operation_type = 'DEL'
        AND del.operation_datetime_utc >= NOW() - INTERVAL ':nb_days days'
        AND del.operation_datetime_utc < NOW() + INTERVAL '2 hours'
),

cors_targeting_activities AS (
   SELECT cor.referenced_report_id, cor.report_id, cor.flag_state
   FROM logbook_reports cor
   JOIN activities
   ON cor.referenced_report_id = activities.report_id
   WHERE
        cor.operation_type = 'COR'
        AND cor.operation_datetime_utc >= NOW() - INTERVAL ':nb_days days'
        AND cor.operation_datetime_utc < NOW() + INTERVAL '2 hours'

),

acknowledged_report_ids AS (
   SELECT DISTINCT referenced_report_id
   FROM logbook_reports
   WHERE
       operation_datetime_utc >= NOW() - INTERVAL ':nb_days days'
       AND operation_datetime_utc < NOW() + INTERVAL '2 hours'
       AND operation_type = 'RET'
       AND value->>'returnStatus' = '000'
       AND referenced_report_id IN (
           SELECT operation_number FROM dels_targeting_activities
           UNION ALL
           SELECT report_id FROM cors_targeting_activities
           UNION ALL
           SELECT report_id FROM activities
       )
),

acknowledged_dels_targeting_activities AS (
    SELECT referenced_report_id
    FROM dels_targeting_activities
    WHERE
        operation_number IN (SELECT referenced_report_id FROM acknowledged_report_ids)
        OR flag_state NOT IN ('FRA', 'GUF', 'VEN') -- flag_states for which we received RET messages
),

acknowledged_cors_targeting_activities AS (
    SELECT referenced_report_id
    FROM cors_targeting_activities
    WHERE
        report_id IN (SELECT referenced_report_id FROM acknowledged_report_ids)
        OR flag_state NOT IN ('FRA', 'GUF', 'VEN') -- flag_states for which we received RET messages
),

activity_dates AS (
    SELECT
        operation_datetime_utc,
        cfr,
        activity_datetime_utc,
        log_type,
        trip_number,
        trip_number_was_computed,
        report_id,
        report_id IN (SELECT referenced_report_id FROM acknowledged_dels_targeting_activities) AS is_deleted,
        report_id IN (SELECT referenced_report_id FROM acknowledged_cors_targeting_activities) AS is_corrected,
        (
            report_id IN (SELECT referenced_report_id FROM acknowledged_report_ids)
            OR flag_state NOT IN ('FRA', 'GUF', 'VEN')
        ) AS is_acknowledged
    FROM activities
),

t AS (
    SELECT
        cfr,
        trip_number,
        trip_number_was_computed,
        MIN(CASE WHEN log_type = 'DEP' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(EXTRACT(epoch FROM activity_datetime_utc - operation_datetime_utc)) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS departure_datetime_utc,
        MIN(CASE WHEN log_type = 'COE' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(EXTRACT(epoch FROM activity_datetime_utc - operation_datetime_utc)) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS first_coe_datetime_utc,
        MAX(CASE WHEN log_type = 'COX' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(EXTRACT(epoch FROM activity_datetime_utc - operation_datetime_utc)) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS last_cox_datetime_utc,
        MIN(CASE WHEN log_type = 'FAR' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(EXTRACT(epoch FROM activity_datetime_utc - operation_datetime_utc)) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS first_far_datetime_utc,
        MAX(CASE WHEN log_type = 'FAR' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(EXTRACT(epoch FROM activity_datetime_utc - operation_datetime_utc)) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS last_far_datetime_utc,
        MAX(CASE WHEN log_type = 'EOF' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(EXTRACT(epoch FROM activity_datetime_utc - operation_datetime_utc)) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS eof_datetime_utc,
        MAX(CASE WHEN log_type = 'RTP' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(EXTRACT(epoch FROM activity_datetime_utc - operation_datetime_utc)) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS return_to_port_datetime_utc,
        MAX(CASE WHEN log_type = 'LAN' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(EXTRACT(epoch FROM activity_datetime_utc - operation_datetime_utc)) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS end_of_landing_datetime_utc,
        MIN(operation_datetime_utc) AS first_operation_datetime_utc,
        MAX(operation_datetime_utc) AS last_operation_datetime_utc
    FROM activity_dates
    GROUP BY cfr, trip_number, trip_number_was_computed
)

SELECT
    cfr,
    trip_number,
    departure_datetime_utc,
    first_coe_datetime_utc,
    last_cox_datetime_utc,
    first_far_datetime_utc,
    last_far_datetime_utc,
    eof_datetime_utc,
    return_to_port_datetime_utc,
    end_of_landing_datetime_utc,
    COALESCE(
        departure_datetime_utc,
        first_coe_datetime_utc,
        last_cox_datetime_utc,
        first_far_datetime_utc,
        last_far_datetime_utc,
        eof_datetime_utc,
        return_to_port_datetime_utc,
        end_of_landing_datetime_utc,
        first_operation_datetime_utc
    ) AS sort_order_datetime_utc
FROM t
