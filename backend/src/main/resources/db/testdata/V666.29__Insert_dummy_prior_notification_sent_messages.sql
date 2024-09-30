INSERT INTO public.prior_notification_sent_messages (
              prior_notification_report_id, prior_notification_source,                                     date_time_utc, communication_means,                                 recipient_address_or_number, success, error_message, recipient_name,               recipient_organization
) VALUES
    (                  'FAKE_OPERATION_103',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',             'EMAIL',                       'bgc-lorient@douane.finances.gouv.fr',    TRUE,          NULL,      'Unité 1',                             'Douane'),

    (                  'FAKE_OPERATION_106',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',             'EMAIL',                  'sgcd-nantes-codm@douane.finances.gouv.fr',    TRUE,          NULL,      'Unité 1',                             'Douane'),
    (                  'FAKE_OPERATION_106',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',             'EMAIL',                   'bsl.lorient@gendarmerie.defense.gouv.fr',    TRUE,          NULL,      'Unité 3',                        'Gendarmerie'),

    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.3 minutes',             'EMAIL',             'pgmarc720.lorient@gendarmerie.defense.gouv.fr',   FALSE,          NULL,      'Unité 3',                        'Gendarmerie'),
    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',             'EMAIL',                    'ggmaratlan@gendarmerie.defense.gouv.fr',   FALSE,          NULL,      'Unité 4',                        'Gendarmerie'),
    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.1 minutes',               'SMS',                                              '+33123456789',   FALSE,          NULL,      'Unité 3',                        'Gendarmerie'),
    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.2 minutes',               'SMS',                                              '+33987654321',   FALSE,          NULL,      'Unité 4',                        'Gendarmerie'),

    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '4.0 minutes',             'EMAIL',             'pgmarc720.lorient@gendarmerie.defense.gouv.fr',   FALSE,          NULL,      'Unité 3',                        'Gendarmerie'),
    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '4.1 minutes',             'EMAIL',                    'ggmaratlan@gendarmerie.defense.gouv.fr',    TRUE,          NULL,      'Unité 4',                        'Gendarmerie'),
    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '4.2 minutes',             'EMAIL',                                    'unite5@ddtm-40.gouv.fr',   FALSE,          NULL,      'Unité 5',                            'DDTM 40'),
    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '4.3 minutes',               'SMS',                                              '+33123456789',    TRUE,          NULL,      'Unité 3',                        'Gendarmerie'),
    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '4.4 minutes',               'SMS',                                              '+33987654321',   FALSE,          NULL,      'Unité 4',                        'Gendarmerie'),
    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '4.5 minutes',               'SMS',                                              '+33000000000',   FALSE,          NULL,      'Unité 5',                            'DDTM 40'),

    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '9.3 minutes',            'EMAIL',             'pgmarc720.lorient@gendarmerie.defense.gouv.fr',    TRUE,          NULL,      'Unité 3',                        'Gendarmerie'),
    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '9.2 minutes',            'EMAIL',                    'ggmaratlan@gendarmerie.defense.gouv.fr',    TRUE,          NULL,      'Unité 4',                        'Gendarmerie'),
    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '9.1 minutes',              'SMS',                                              '+33123456789',    TRUE,          NULL,      'Unité 3',                        'Gendarmerie'),
    (                  'FAKE_OPERATION_108',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '9.0 minutes',              'SMS',                                              '+33987654321',    TRUE,          NULL,      'Unité 4',                        'Gendarmerie'),

    (                  'FAKE_OPERATION_110',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',             'EMAIL',                               'ddtm-samel@morbihan.gouv.fr',    TRUE,          NULL,      'Unité 6',                               'DDTM'),
    (                  'FAKE_OPERATION_110',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',             'EMAIL',                                          'sd56@ofb.gouv.fr',   FALSE,          NULL,      'Unité 7', 'Office Français de la Biodiversité'),
    (                  'FAKE_OPERATION_110',                'LOGBOOK', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',               'SMS',                                              '+33111111111',   FALSE,          NULL,      'Unité 7', 'Office Français de la Biodiversité'),

    ('00000000-0000-4000-0000-000000000003',                 'MANUAL', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',             'EMAIL',                                 'ddtm-pre@morbihan.gouv.fr',    TRUE,          NULL,      'Unité 9',                               'DDTM'),
    ('00000000-0000-4000-0000-000000000003',                 'MANUAL', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',             'EMAIL',                                      'namo@example.gouv.fr',   FALSE,          NULL,     'Unité 10',                          'DIRM / DM'),

    ('00000000-0000-4000-0000-000000000004',                 'MANUAL', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',             'EMAIL',                                     'dreal@example.gouv.fr',   FALSE,          NULL,     'Unité 11',                               'DDTM'),

    ('00000000-0000-4000-0000-000000000006',                 'MANUAL', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',             'EMAIL',                                'ddtm-ulam@morbihan.gouv.fr',    TRUE,          NULL,     'Unité 11',                               'DDTM'),

    ('00000000-0000-4000-0000-000000000008',                 'MANUAL', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',             'EMAIL',                                      'dirm@example.gouv.fr',   FALSE,          NULL,     'Unité 12',                          'DIRM / DM'),

    ('00000000-0000-4000-0000-000000000010',                 'MANUAL', NOW() AT TIME ZONE 'UTC' - INTERVAL '2.0 minutes',             'EMAIL', 'pam-jeanne-barret.dirm-memn@developpement-durable.gouv.fr',    TRUE,          NULL,     'Unité 12',                          'DIRM / DM');
