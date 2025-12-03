CREATE INDEX IF NOT EXISTS beacon_malfunctions_unarchived_stage_idx
ON beacon_malfunctions (stage)
WHERE stage != 'archived';

CREATE INDEX IF NOT EXISTS beacon_malfunctions_vessel_id_idx
ON beacon_malfunctions (vessel_id);

CREATE INDEX IF NOT EXISTS beacon_malfunctions_malfunction_start_date_utc_idx
ON beacon_malfunctions (malfunction_start_date_utc);

CREATE INDEX IF NOT EXISTS beacon_malfunctions_archived_vessel_status_last_modification_date_utc_idx
ON beacon_malfunctions (vessel_status_last_modification_date_utc)
WHERE stage = 'archived';
