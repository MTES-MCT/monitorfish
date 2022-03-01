ALTER TABLE public.beacon_status_actions RENAME TO beacon_malfunction_actions;

ALTER TABLE public.beacon_malfunction_actions
    RENAME COLUMN beacon_status_id TO beacon_malfunction_id;