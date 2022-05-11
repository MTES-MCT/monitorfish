-- This view shows the list of unique facade names, plus the added "Hors facade" label.
-- It is meant to be used to populate field filters in Metabase dashboards.
CREATE VIEW analytics_facade_names AS
SELECT DISTINCT facade FROM facade_areas_subdivided
UNION ALL
SELECT 'Hors façade' AS facade;