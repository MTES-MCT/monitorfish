DELETE FROM beacon_malfunction_notifications;

INSERT INTO beacon_malfunction_notifications (
    id, beacon_malfunction_id,                                                                         date_time_utc,                         notification_type, communication_means, recipient_function, recipient_name, recipient_address_or_number
)
VALUES
(    1,                     1, (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '1 month 2 days 17 hours 57 minutes', 'MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION',               'FAX',   'VESSEL_CAPTAIN', 'Captain Cook',                '0100000000'),
(    2,                     2,                 (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '3 hours 57 minutes', 'MALFUNCTION_AT_SEA_INITIAL_NOTIFICATION',               'SMS',   'VESSEL_CAPTAIN',           null,                '0111111111');
