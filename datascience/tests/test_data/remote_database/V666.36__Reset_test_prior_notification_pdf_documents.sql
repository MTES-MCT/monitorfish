DELETE FROM public.prior_notification_pdf_documents;

INSERT INTO public.prior_notification_pdf_documents (
                                     report_id,    source,                                              generation_datetime_utc,                                                   pdf_document) VALUES
    (   '7ee30c6c-adf9-4f60-a4f1-f7f15ab92803', 'LOGBOOK',                                                '2020-05-06 18:42:03', '\x4973206973205245414c4c5920612050444620646f63756d656e74203f'),
    (   'fc16ea8a-3148-44b2-977f-de2a2ae550b9', 'LOGBOOK',                                                '2020-05-06 18:45:23', '\x4973206973205245414c4c5920612050444620646f63756d656e74203f'),
    (                                      '8', 'LOGBOOK',   ((now() AT TIME ZONE 'UTC') - INTERVAL '1 year 3 days')::TIMESTAMP,       '\x54686973206973206e6f7420612050444620646f63756d656e74'),
    (                                     '12', 'LOGBOOK', ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 2 hours')::TIMESTAMP,               '\x5468697320697320612050444620646f63756d656e74'),
    (                     'existing-report-id', 'LOGBOOK',  ((now() AT TIME ZONE 'UTC') - INTERVAL '1 week 2 hours')::TIMESTAMP,       '\x416e6f6e796d6f7573206469646e277420636f64652074686973'),
    (   '00000000-0000-4000-0000-000000000001',  'MANUAL',  ((now() AT TIME ZONE 'UTC') - INTERVAL  '1 day 2 hours')::TIMESTAMP,       '\x416e6f6e796d6f7573206469646e277420636f64652074686973'),
    (   '00000000-0000-4000-0000-000000000002',  'MANUAL',  ((now() AT TIME ZONE 'UTC') - INTERVAL  '1 day 2 hours')::TIMESTAMP,       '\x416e6f6e796d6f7573206469646e277420636f64652074686973'),
    (   '00000000-0000-4000-0000-000000000005',  'MANUAL',  ((now() AT TIME ZONE 'UTC') - INTERVAL  '1 day 2 hours')::TIMESTAMP,       '\x416e6f6e796d6f7573206469646e277420636f64652074686973');
