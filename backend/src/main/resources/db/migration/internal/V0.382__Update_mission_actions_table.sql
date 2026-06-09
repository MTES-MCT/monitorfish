ALTER TABLE mission_actions ADD COLUMN is_gangway_deployed BOOLEAN;

ALTER TABLE mission_actions
  ALTER COLUMN species_weight_controlled TYPE VARCHAR(20)
    USING CASE WHEN species_weight_controlled = true  THEN 'YES'
               WHEN species_weight_controlled = false THEN 'NO'
               ELSE NULL END,
  ALTER COLUMN species_size_controlled TYPE VARCHAR(20)
    USING CASE WHEN species_size_controlled = true  THEN 'YES'
               WHEN species_size_controlled = false THEN 'NO'
               ELSE NULL END;

ALTER TABLE mission_actions
  ADD COLUMN propulsion_engine_power_control        VARCHAR(20),
  ADD COLUMN fishing_licences_match_activity        VARCHAR(20),
  ADD COLUMN stowage_plan_present                   VARCHAR(20),
  ADD COLUMN onboard_weighing_permit                VARCHAR(20),
  ADD COLUMN weighing_certificate_and_systems_valid VARCHAR(20),
  ADD COLUMN under_sized_separate_stowage           VARCHAR(20),
  ADD COLUMN under_sized_separate_recording         VARCHAR(20),
  ADD COLUMN logbook_filled_prior_to_control        VARCHAR(20),
  ADD COLUMN vms_emission_control_before_arrival  VARCHAR(20),
  ADD COLUMN port_entrance_and_landing_authorized VARCHAR(20),
  ADD COLUMN minimum_conservation_reference_size_controlled VARCHAR(20),
  ADD COLUMN crates_weighing_sampling_control               VARCHAR(20),
  ADD COLUMN approved_weighing_operator_information         VARCHAR(20),
  ADD COLUMN hold_controlled_after_unloading                VARCHAR(20),
  ADD COLUMN catches_weighed_at_landing                     VARCHAR(20),
  ADD COLUMN discarded_species                              JSONB;
