CREATE OR REPLACE VIEW regulations_view AS
SELECT id,
       law_type,
       facade,
       topic,
       zone,
       region,
       fishing_period,
       species,
       gears,
       regulatory_references,
       geometry_simplified,
       row_hash,
       next_id
FROM regulations;
ALTER TABLE regulations_view
    RENAME COLUMN geometry_simplified to geometry;
