-- Rename tables

ALTER TABLE ers RENAME TO logbook_reports;
ALTER TABLE ers_messages RENAME TO logbook_raw_messages;

-- Drop unused column in logbook_raw_messages
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

-- Rename columns
ALTER TABLE logbook_reports
    RENAME COLUMN ers_id TO report_id;

ALTER TABLE logbook_reports
   RENAME COLUMN referenced_ers_id TO referenced_report_id;

ALTER TABLE logbook_reports
   RENAME COLUMN ers_datetime_utc TO report_datetime_utc;

-- Rename sequence
ALTER SEQUENCE ers_id_seq RENAME TO logbook_report_id_seq;

-- Rename indices
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
DROP INDEX ers_messages_operation_number_idx; -- An index is already created with the primary key, so this one can be dropped

-- Add transmission_format and software columns
CREATE TYPE public.logbook_message_transmission_format AS ENUM ('ERS', 'FLUX');

ALTER TABLE logbook_reports
    ADD COLUMN transmission_format logbook_message_transmission_format,
    ADD COLUMN software VARCHAR(100);

UPDATE logbook_reports
SET transmission_format = 'ERS';

ALTER TABLE logbook_reports
ALTER COLUMN transmission_format
SET NOT NULL;

-- Wrap the value field of FAR reports in an array, as a single FLUX report can hold declarations for multiples fishing operations (hauls)
UPDATE logbook_reports
SET value = jsonb_build_object('hauls', jsonb_build_array(value))
WHERE log_type = 'FAR';

-- Adjust operation_number and report_id data type to accomodate for FLUX's longer report_ids and operation_numbers compared to ERS.
ALTER TABLE logbook_reports ALTER COLUMN operation_number TYPE VARCHAR(100);
ALTER TABLE logbook_reports ALTER COLUMN report_id TYPE VARCHAR(100);
ALTER TABLE logbook_reports ALTER COLUMN referenced_report_id TYPE VARCHAR(100);
ALTER TABLE logbook_raw_messages ALTER column operation_number TYPE VARCHAR(100);

-- Adjust log_type VARCHAR max length to accomodate for FLUX's new log types
ALTER TABLE logbook_reports ALTER COLUMN log_type TYPE VARCHAR(100);

-- Adjust trip_number data type to accomodate for the fact that FLUX's trip numbers are strings and not integers
ALTER TABLE logbook_reports ALTER COLUMN trip_number TYPE VARCHAR(100);