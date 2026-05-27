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
  ADD COLUMN under_sized_separate_recording         VARCHAR(20);
