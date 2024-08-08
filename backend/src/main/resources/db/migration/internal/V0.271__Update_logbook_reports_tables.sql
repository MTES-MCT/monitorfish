ALTER TABLE public.logbook_reports
ADD COLUMN is_test_message BOOLEAN NOT NULL DEFAULT false;

-- To execute manually after deployment, in order to avoid a down time :

-- WITH test_messages AS (
--     SELECT
--         operation_number
--     FROM logbook_raw_messages
--     WHERE (
--         xpath(
--             '//ers:OPS/attribute::TS',
--             xml_message::xml,
--             ARRAY[ARRAY['ers', 'http://ec.europa.eu/fisheries/schema/ers/v3']]
--         )
--     )[1]::VARCHAR = '1'
-- )
-- 
-- UPDATE logbook_reports
-- SET is_test_message = true
-- WHERE operation_number IN (SELECT operation_number FROM test_messages);
