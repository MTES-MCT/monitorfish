DELETE FROM public.beacon_malfunction_actions;

INSERT INTO beacon_malfunction_actions (
    id, beacon_malfunction_id, property_name,      previous_value,         next_value,                                                         date_time_utc
) VALUES
    (1,	                    5,       'STAGE', 'INITIAL_ENCOUNTER', 'TARGETING_VESSEL', (NOW() AT TIME ZONE 'UTC')::TIMESTAMP - INTERVAL '2 hours 10 minutes');

