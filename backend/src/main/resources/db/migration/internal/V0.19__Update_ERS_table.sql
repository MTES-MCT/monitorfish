-- Update ers table
ALTER TABLE public.ers
    ADD COLUMN analyzed_by_rules varchar(100)[];

DROP INDEX IF EXISTS ers_ircs_idx;
DROP INDEX IF EXISTS ers_cfr_idx;
DROP INDEX IF EXISTS ers_log_type_idx;
DROP INDEX IF EXISTS ers_operation_datetime_utc_idx;
DROP INDEX IF EXISTS ers_trip_number_idx;
DROP INDEX IF EXISTS ers_operation_number_idx;
ALTER TABLE ers
    DROP CONSTRAINT IF EXISTS ers_pkey;
DROP INDEX IF EXISTS ers_pkey_idx;
DROP INDEX IF EXISTS ers_pkey;

CREATE INDEX ON ers (log_type, operation_datetime_utc DESC);
CREATE INDEX ON ers (cfr, operation_datetime_utc DESC);
CREATE INDEX ON ers (analyzed_by_rules, operation_datetime_utc DESC);
SELECT create_hypertable('ers', 'operation_datetime_utc', if_not_exists => TRUE, migrate_data => true);

SET enable_seqscan = OFF;

ALTER TABLE public.ers
    ALTER COLUMN id type bigint;
