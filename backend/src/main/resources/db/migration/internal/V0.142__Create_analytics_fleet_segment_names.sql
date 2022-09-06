-- This view shows the list of unique segment names, plus the added "Hors segment" label.
-- It is meant to be used to populate field filters in Metabase dashboards.
CREATE VIEW analytics_segment_names AS
SELECT DISTINCT segment
FROM fleet_segments
UNION ALL
SELECT 'Hors segment' AS segment;
