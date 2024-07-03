INSERT INTO public.prior_notification_pdf_documents (
    report_id,
    source,
    generation_datetime_utc,
    pdf_document
) VALUES
    ('FAKE_OPERATION_103', 'MANUAL', '2024-07-01 12:00:00', decode('5044462064617461', 'hex')),
    ('FAKE_OPERATION_104', 'LOGBOOK', '2024-07-02 13:30:00', decode('50646664617461', 'hex')),
    ('FAKE_OPERATION_106', 'LOGBOOK', '2024-07-03 14:45:00', decode('5044462020202020', 'hex')),
    ('FAKE_OPERATION_108', 'LOGBOOK', '2024-07-03 14:45:00', decode('5044462020202020', 'hex')),
    ('FAKE_OPERATION_109', 'LOGBOOK', '2024-07-04 15:15:00', decode('5044467465737464', 'hex'));
