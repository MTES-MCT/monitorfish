ALTER TABLE public.regulations
    DROP COLUMN facade;

DROP VIEW regulations_view;

CREATE OR REPLACE VIEW regulations_view AS
SELECT id,
       law_type,
       topic,
       zone,
       region,
       other_info,
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
