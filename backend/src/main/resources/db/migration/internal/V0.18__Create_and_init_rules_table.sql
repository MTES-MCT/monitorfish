CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create table rules
(
    rule_id          uuid primary key,
    title            varchar(255)             not null,
    active           boolean                  not null,
    creation_date    timestamp with time zone not null,
    last_update_date timestamp with time zone,
    last_run_date    timestamp with time zone,
    last_run_success boolean,
    value            jsonb                    not null
);

INSERT INTO rules
VALUES (uuid_generate_v4(),
        'Save an alert when PNO and LAN weights are below tolerance',
        TRUE,
        NOW(),
        null,
        null,
        null,
        ('{' ||
         '"type":"PNO_LAN_WEIGHT_TOLERANCE",' ||
         '"name": "PNO_LAN_WEIGHT_TOLERANCE",' ||
         '"inputSource": "ERS",' ||
         '"percentOfTolerance": 10.0,' ||
         '"minimumWeightThreshold": 50.0' ||
         '}')::jsonb);
