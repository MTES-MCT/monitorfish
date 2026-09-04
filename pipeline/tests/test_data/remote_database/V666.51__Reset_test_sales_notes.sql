DELETE FROM sales_notes;
DELETE FROM sales_notes_raw_messages;

-- A recent sales note for CFR 'ABC000306959', which has an active, non-archived
-- beacon malfunction (see V666.3). Used by
-- test_beacon_malfunction_activity_detection.py to check that the flow follows the
-- malfunction and raises a SALE_DURING_BEACON_MALFUNCTION alert.
-- The 'BMF_' operation_number prefix is excluded from other tests' assertions on the
-- full contents of this table (see test_sales_and_logbook.py).
INSERT INTO sales_notes (
    operation_number, operation_datetime_utc, operation_type, report_id,
    cfr, sales_datetime_utc, integration_datetime_utc, transmission_format
) VALUES (
    'BMF_SALE_01', (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 hour', 'DAT',
    'BMF_SALE_01', 'ABC000306959', (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 hour',
    (NOW() AT TIME ZONE 'UTC') - INTERVAL '1 hour', 'ERS'
);
