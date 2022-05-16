-- This view shows the list of unique control types.
-- It is meant to be used to populate field filters in Metabase dashboards.
CREATE VIEW analytics_control_types AS
SELECT DISTINCT control_type
FROM controls;