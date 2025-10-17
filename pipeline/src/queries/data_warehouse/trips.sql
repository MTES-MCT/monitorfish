WITH t AS (
    SELECT
        cfr,
        trip_number,
        trip_number_was_computed,
        MIN(CASE WHEN log_type = 'DEP' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(activity_datetime_utc - operation_datetime_utc) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS departure_datetime_utc,
        MIN(CASE WHEN log_type = 'COE' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(activity_datetime_utc - operation_datetime_utc) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS first_coe_datetime_utc,
        MAX(CASE WHEN log_type = 'COX' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(activity_datetime_utc - operation_datetime_utc) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS last_cox_datetime_utc,
        MIN(CASE WHEN log_type = 'FAR' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(activity_datetime_utc - operation_datetime_utc) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS first_far_datetime_utc,
        MAX(CASE WHEN log_type = 'FAR' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(activity_datetime_utc - operation_datetime_utc) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS last_far_datetime_utc,
        MAX(CASE WHEN log_type = 'EOF' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(activity_datetime_utc - operation_datetime_utc) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS eof_datetime_utc,
        MAX(CASE WHEN log_type = 'RTP' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(activity_datetime_utc - operation_datetime_utc) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS return_to_port_datetime_utc,
        MAX(CASE WHEN log_type = 'LAN' AND NOT is_deleted AND NOT is_corrected AND is_acknowledged AND ABS(activity_datetime_utc - operation_datetime_utc) / 3600 / 24 / 365 < 5 THEN activity_datetime_utc END) AS end_of_landing_datetime_utc,
        MIN(operation_datetime_utc) AS first_operation_datetime_utc,
        MAX(operation_datetime_utc) AS last_operation_datetime_utc
    FROM monitorfish.activity_dates
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
    ) AS sort_order_datetime_utc,
    first_operation_datetime_utc,
    last_operation_datetime_utc
FROM t
