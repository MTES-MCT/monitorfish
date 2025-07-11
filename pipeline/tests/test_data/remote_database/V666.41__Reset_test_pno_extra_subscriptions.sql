DELETE FROM pno_extra_subscriptions;
INSERT INTO pno_extra_subscriptions (
        pno_type_name, port_locode, recipient_name, recipient_organization, communication_means, recipient_email_address_or_number
) VALUES
    ('Préavis type 2',     'FRDPE',   'Nozey Joey',         'PNO sniffers',             'EMAIL',             'nozey.joey@pno.snif'),
    ('Préavis type 1',     'FRZJZ',   'Nozey Joey',         'PNO sniffers',             'EMAIL',             'nozey.joey@pno.snif'),
    ('Préavis type 2',     'FRZJZ',   'Nozey Joey',         'PNO sniffers',             'EMAIL',             'nozey.joey@pno.snif'),
    ('Préavis type 2',     'FRZJZ',       'Ronald',            'Mc Donald',             'EMAIL',      'ronald.mcdonald@ham.burger'),
    ('Préavis type 2',     'FRZJZ',       'Ronald',            'Mc Donald',               'SMS',                      '0000000000');