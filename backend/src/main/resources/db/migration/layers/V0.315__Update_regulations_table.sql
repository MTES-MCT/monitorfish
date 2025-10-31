ALTER TABLE public.regulations
    ADD COLUMN tags text[];

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
       geometry_simplified AS geometry,
       row_hash,
       next_id,
       tags
FROM regulations;