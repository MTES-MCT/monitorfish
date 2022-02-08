ALTER TABLE ers RENAME TO logbook_reports;
ALTER TABLE ers_messages RENAME TO logbook_raw_messages;

ALTER TABLE logbook_raw_messages
    DROP COLUMN operation_country,
    DROP COLUMN operation_datetime_utc,
    DROP COLUMN operation_type,
    DROP COLUMN ers_id,
    DROP COLUMN referenced_ers_id,
    DROP COLUMN ers_datetime_utc,
    DROP COLUMN cfr,
    DROP COLUMN ircs,
    DROP COLUMN external_identification,
    DROP COLUMN vessel_name,
    DROP COLUMN flag_state,
    DROP COLUMN imo,
    DROP COLUMN integration_datetime_utc,
    DROP COLUMN trip_number;

ALTER TABLE logbook_reports
    RENAME COLUMN ers_id TO report_id;

ALTER TABLE logbook_reports
   RENAME COLUMN referenced_ers_id TO referenced_report_id;

ALTER TABLE logbook_reports
   RENAME COLUMN ers_datetime_utc TO report_datetime_utc;

ALTER SEQUENCE ers_id_seq RENAME TO logbook_report_id_seq;

ALTER INDEX ers_analyzed_by_rules_operation_datetime_utc_idx RENAME TO logbook_report_analyzed_by_rules_operation_datetime_utc_idx;
ALTER INDEX ers_cfr_operation_datetime_utc_idx RENAME TO logbook_report_cfr_operation_datetime_utc_idx;
ALTER INDEX ers_cfr_trip_number_idx RENAME TO logbook_report_cfr_trip_number_idx;
ALTER INDEX ers_del_referenced_ers_id_idx RENAME TO logbook_report_del_referenced_report_id_idx;
ALTER INDEX ers_id_idx RENAME TO logbook_report_id_idx;
ALTER INDEX ers_log_type_operation_datetime_utc_idx RENAME TO logbook_report_log_type_operation_datetime_utc_idx;
ALTER INDEX ers_missing_trip_numbers RENAME TO logbook_report_missing_trip_numbers;
ALTER INDEX ers_operation_datetime_utc_idx RENAME TO logbook_report_operation_datetime_utc_idx;
ALTER INDEX ers_ret_referenced_ers_id_idx RENAME TO logbook_report_ret_referenced_report_id_idx;

ALTER INDEX ers_messages_pkey RENAME TO logbook_raw_messages_pkey;
DROP INDEX ers_messages_operation_number_idx;

