CREATE OR REPLACE FUNCTION find_pno_by_report_id(
    searched_pno_report_id VARCHAR,
    searched_pno_operation_datetime_utc VARCHAR
)
RETURNS SETOF logbook_reports AS $$
    BEGIN
        RETURN QUERY
        WITH
            searched_pno AS (
                SELECT *
                FROM logbook_reports lr
                WHERE
                    lr.operation_datetime_utc
                        BETWEEN CAST(searched_pno_operation_datetime_utc AS TIMESTAMP) - INTERVAL '4 hours'
                        AND CAST(searched_pno_operation_datetime_utc AS TIMESTAMP) + INTERVAL '4 hours'
                    AND lr.report_id = searched_pno_report_id
                    AND lr.log_type = 'PNO'
                    AND lr.enriched = TRUE
            ),

           dels_targeting_searched_pno AS (
               SELECT del.referenced_report_id, del.operation_number, searched_pno.flag_state
               FROM logbook_reports del
               JOIN searched_pno
               ON del.referenced_report_id = searched_pno.report_id
               WHERE
                   del.operation_datetime_utc
                       BETWEEN CAST(searched_pno_operation_datetime_utc AS TIMESTAMP) - INTERVAL '48 hours'
                       AND CAST(searched_pno_operation_datetime_utc AS TIMESTAMP) + INTERVAL '48 hours'
                   AND del.operation_type = 'DEL'
           ),

           cors_targeting_searched_pno AS (
               SELECT *
               FROM logbook_reports lr
               WHERE
                   lr.operation_datetime_utc
                       BETWEEN CAST(searched_pno_operation_datetime_utc AS TIMESTAMP) - INTERVAL '48 hours'
                       AND CAST(searched_pno_operation_datetime_utc AS TIMESTAMP) + INTERVAL '48 hours'
                   AND lr.operation_type = 'COR'
                   AND lr.referenced_report_id = searched_pno_report_id
           ),

           acknowledged_cors_and_dels AS (
               SELECT lr.referenced_report_id
               FROM logbook_reports lr
               WHERE
                   lr.operation_datetime_utc
                       BETWEEN CAST(searched_pno_operation_datetime_utc AS TIMESTAMP) - INTERVAL '48 hours'
                       AND CAST(searched_pno_operation_datetime_utc AS TIMESTAMP) + INTERVAL '48 hours'
                   AND lr.operation_type = 'RET'
                   AND lr.value->>'returnStatus' = '000'
                   AND lr.referenced_report_id IN (
                       SELECT dels_targeting_searched_pno.operation_number FROM dels_targeting_searched_pno
                       UNION ALL
                       SELECT cors_targeting_searched_pno.report_id FROM cors_targeting_searched_pno
                   )
           ),

            acknowledged_dels_targeting_searched_pno AS (
                SELECT del.referenced_report_id
                FROM dels_targeting_searched_pno del
                WHERE
                    del.operation_number IN (SELECT acknowledged_cors_and_dels.referenced_report_id FROM acknowledged_cors_and_dels)
                    OR del.flag_state NOT IN ('FRA', 'GUF', 'VEN') -- flag_states for which we received RET messages
            ),

            acknowledged_cors_targeting_searched_pno AS (
                SELECT cor.referenced_report_id
                FROM cors_targeting_searched_pno cor
                WHERE
                    cor.report_id IN (SELECT acknowledged_cors_and_dels.referenced_report_id FROM acknowledged_cors_and_dels)
                    OR cor.flag_state NOT IN ('FRA', 'GUF', 'VEN') -- flag_states for which we received RET messages
            )

        SELECT *
        FROM searched_pno
        WHERE
            searched_pno.report_id NOT IN (SELECT acknowledged_dels_targeting_searched_pno.referenced_report_id FROM acknowledged_dels_targeting_searched_pno) AND
            searched_pno.report_id NOT IN (SELECT acknowledged_cors_targeting_searched_pno.referenced_report_id FROM acknowledged_cors_targeting_searched_pno);
        RETURN;
    END;
$$ LANGUAGE plpgsql STABLE;
