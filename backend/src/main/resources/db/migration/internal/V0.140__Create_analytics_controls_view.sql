-- This view contains all controls data, with NULL values
-- in 'facade' and 'segments' columns replaced with default string values
-- in order to be able to select them in field filters
CREATE VIEW analytics_controls AS
SELECT id,
       vessel_id,
       controller_id,
       control_type,
       control_datetime_utc,
       input_start_datetime_utc,
       input_end_datetime_utc,
       CASE WHEN facade IS NULL THEN 'Hors façade' ELSE facade END                       AS facade,
       longitude,
       latitude,
       port_locode,
       mission_order,
       vessel_targeted,
       cnsp_called_unit,
       cooperative,
       pre_control_comments,
       infraction,
       infraction_ids,
       diversion,
       escort_to_quay,
       seizure,
       seizure_comments,
       post_control_comments,
       gear_controls,
       catch_controls,
       CASE WHEN segments = '{}' THEN '{Hors segment}'::VARCHAR(100)[] ELSE segments END AS segments,
       fao_areas
FROM controls
