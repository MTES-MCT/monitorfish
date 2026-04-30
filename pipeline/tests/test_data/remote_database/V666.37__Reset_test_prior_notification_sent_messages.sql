DELETE FROM public.prior_notification_sent_messages;

-- Add successful send for original report #15 so the COR correction will have is_correction = true
INSERT INTO public.prior_notification_sent_messages (
    prior_notification_report_id,
    prior_notification_source,
    success,
    date_time_utc,
    communication_means,
    recipient_address_or_number,
    recipient_name,
    recipient_organization,
    error_message
) VALUES (
    '15',
    'LOGBOOK',
    true,
    ((now() AT TIME ZONE 'UTC') - INTERVAL '1 month 35 minutes')::TIMESTAMP,
    'EMAIL',
    'test@example.org',
    'Test Recipient',
    'Test Organization',
    NULL
),
-- Add successful send for manual PNO report 00000000-0000-4000-0000-000000000007 so it will have is_correction = true
(
    '00000000-0000-4000-0000-000000000007',
    'MANUAL',
    true,
    ((now() AT TIME ZONE 'UTC') - INTERVAL '20 minutes')::TIMESTAMP,
    'EMAIL',
    'test@example.org',
    'Test Recipient',
    'Test Organization',
    NULL
);
