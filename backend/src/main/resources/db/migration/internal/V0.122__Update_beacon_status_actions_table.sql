ALTER TABLE public.beacon_status_actions RENAME TO beacon_malfunction_actions;
ALTER SEQUENCE public.beacon_status_actions_id_seq RENAME TO beacon_malfunction_actions_id_seq;

ALTER TABLE public.beacon_malfunction_actions
    RENAME COLUMN beacon_status_id TO beacon_malfunction_id;