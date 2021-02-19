/*
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO
$WRAPPER$
    BEGIN
        CREATE OR REPLACE FUNCTION createDummyRule() RETURNS int
            LANGUAGE plpgsql AS
        $$
        DECLARE
            ruleUUID                   uuid := uuid_generate_v4();
            minusHoursCreationDate     int  := floor(random() * 10 + 1)::int;
            minusHoursModificationDate int  := floor(random() * 10 + 1)::int;
        BEGIN
            INSERT INTO rules
            VALUES (ruleUUID,
                    'Save an alert when PNO and LAN weights are below tolerance',
                    TRUE,
                    NOW() - (minusHoursCreationDate || ' WEEK')::interval,
                    NOW() - (minusHoursModificationDate || ' HOUR')::interval,
                    NOW() - (minusHoursModificationDate || ' HOUR')::interval,
                    cast(cast(random() AS INTEGER) AS boolean),
                    ('{' ||
                     '"type":"PNO_LAN_WEIGHT_TOLERANCE",' ||
                     '"name": "PNO_LAN_WEIGHT_TOLERANCE",' ||
                     '"inputSource": "ERS",' ||
                     '"percentOfTolerance": 10.0' ||
                     '}')::jsonb);
            RETURN 1;
        END
        $$;

        CREATE OR REPLACE FUNCTION createDummyRules() RETURNS int
            LANGUAGE plpgsql AS
        $$
        DECLARE
            myCounter int;
        BEGIN
            myCounter := 0;
            WHILE myCounter < 10
                LOOP
                    myCounter := myCounter + 1;
                    PERFORM createDummyRule();
                END LOOP;
            RETURN 1;
        END
        $$;

        PERFORM createDummyRules();
    END
$WRAPPER$;
*/