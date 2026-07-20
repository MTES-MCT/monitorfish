ALTER TABLE mission_actions RENAME COLUMN logbook_filled_prior_to_control TO logbook_opened_prior_to_control;
ALTER TABLE mission_actions RENAME COLUMN fishing_licences_match_activity TO european_fishing_licence_valid;
ALTER TABLE mission_actions RENAME COLUMN catches_weighed_at_landing TO weighing_operations_monitored_by_inspectors;
ALTER TABLE mission_actions RENAME COLUMN crates_weighing_sampling_control TO weight_control_method;
ALTER TABLE mission_actions RENAME COLUMN is_gangway_deployed TO is_unit_boarded;

ALTER TABLE mission_actions ADD COLUMN gangway_present_and_compliant VARCHAR(20);

-- `weight_control_method` was a YES/NO/NOT_APPLICABLE check: a YES/NO answer cannot tell which
-- weighing method was used, so only NOT_APPLICABLE can be carried over to the new enum.
UPDATE mission_actions SET weight_control_method = NULL WHERE weight_control_method IN ('YES', 'NO');
