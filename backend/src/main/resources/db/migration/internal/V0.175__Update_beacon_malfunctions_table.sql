-- Replace stages in beacon_malfunctions table
ALTER TYPE public.beacon_malfunctions_stage RENAME VALUE 'TARGETING_VESSEL' TO 'FOLLOWING';
ALTER TYPE public.beacon_malfunctions_stage RENAME VALUE 'CROSS_CHECK' TO 'TARGETING_VESSEL';
ALTER TYPE public.beacon_malfunctions_stage RENAME VALUE 'RELAUNCH_REQUEST' TO 'AT_QUAY';

-- Replace stages in beacon_malfunctions_actions table
-- can contain both stage and status value, it is not typed as beacon_malfunctions_stage

-- Replace TARGETING_VESSEL by FOLLOWING

UPDATE
    beacon_malfunction_actions
SET
    previous_value = 'FOLLOWING'
WHERE
    previous_value = 'TARGETING_VESSEL';

UPDATE
    beacon_malfunction_actions
SET
    next_value = 'FOLLOWING'
WHERE
    next_value = 'TARGETING_VESSEL';


-- Replace CROSS_CHECK by TARGETING_VESSEL

UPDATE
    beacon_malfunction_actions
SET
    previous_value = 'TARGETING_VESSEL'
WHERE
    previous_value = 'CROSS_CHECK';

UPDATE
    beacon_malfunction_actions
SET
    next_value = 'TARGETING_VESSEL'
WHERE
    next_value = 'CROSS_CHECK';


-- Replace RELAUNCH_REQUEST by AT_QUAY

UPDATE
    beacon_malfunction_actions
SET
    previous_value = 'AT_QUAY'
WHERE
    previous_value = 'RELAUNCH_REQUEST';

UPDATE
    beacon_malfunction_actions
SET
    next_value = 'AT_QUAY'
WHERE
    next_value = 'RELAUNCH_REQUEST';
