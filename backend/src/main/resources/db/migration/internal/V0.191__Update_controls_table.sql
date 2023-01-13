DROP view analytics_controls;

DELETE FROM public.controls;

ALTER TABLE public.controls
    RENAME COLUMN control_type to action_type;

ALTER TABLE public.controls
    RENAME COLUMN control_datetime_utc to action_datetime_utc;

ALTER TABLE public.controls
    RENAME COLUMN gear_controls to gear_onboard;

ALTER TABLE public.controls
    RENAME COLUMN seizure_comments TO seizure_and_diversion_comments;

ALTER TABLE public.controls
    RENAME COLUMN post_control_comments TO other_comments;

ALTER TABLE public.controls
    RENAME COLUMN catch_controls TO species_onboard;

ALTER TABLE public.controls
    ADD COLUMN mission_id INTEGER,
    ADD COLUMN emits_vms VARCHAR,
    ADD COLUMN emits_ais VARCHAR,
    ADD COLUMN logbook_matches_activity VARCHAR,
    ADD COLUMN licences_match_activity VARCHAR,
    ADD COLUMN species_weight_controlled BOOLEAN,
    ADD COLUMN species_size_controlled BOOLEAN,
    ADD COLUMN separate_stowage_of_preserved_species BOOLEAN,
    ADD COLUMN logbook_infractions JSONB,
    ADD COLUMN licences_and_logbook_observations VARCHAR,
    ADD COLUMN gear_infractions JSONB,
    ADD COLUMN species_infractions JSONB,
    ADD COLUMN species_observations VARCHAR,
    ADD COLUMN seizure_and_diversion BOOLEAN,
    ADD COLUMN other_infractions JSONB,
    ADD COLUMN number_of_vessels_flown_over INTEGER,
    ADD COLUMN unit_without_omega_gauge BOOLEAN,
    ADD COLUMN control_quality_comments VARCHAR,
    ADD COLUMN feedback_sheet_required BOOLEAN,
    ADD COLUMN is_from_poseidon BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN user_trigram VARCHAR,
    DROP COLUMN controller_id,
    DROP COLUMN seizure,
    DROP COLUMN escort_to_quay,
    DROP COLUMN cnsp_called_unit,
    DROP COLUMN pre_control_comments,
    DROP COLUMN mission_order,
    DROP COLUMN cooperative,
    DROP COLUMN infraction,
    DROP COLUMN infraction_ids,
    DROP COLUMN input_start_datetime_utc,
    DROP COLUMN input_end_datetime_utc,
    DROP COLUMN segments,
    ADD COLUMN segments JSONB;

ALTER TABLE public.controls RENAME to actions;
