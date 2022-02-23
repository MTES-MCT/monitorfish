CREATE OR REPLACE VIEW reglementation_peche_view AS SELECT id, law_type, facade, topic, zone, region, fishing_period,
                                                           species, gears, regulatory_references, geometry_simplified,
                                                           row_hash
                                                    FROM reglementation_peche;
ALTER TABLE reglementation_peche_view RENAME COLUMN geometry_simplified to geometry;
