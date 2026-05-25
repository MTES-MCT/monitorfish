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
