ALTER TABLE mission_actions
  ADD COLUMN minimum_conservation_reference_size_controlled VARCHAR(20),
  ADD COLUMN crates_weighing_sampling_control               VARCHAR(20),
  ADD COLUMN approved_weighing_operator_information         VARCHAR(20),
  ADD COLUMN hold_controlled_after_unloading                VARCHAR(20),
  ADD COLUMN catches_weighed_at_landing                     VARCHAR(20),
  ADD COLUMN discarded_species                              JSONB;
