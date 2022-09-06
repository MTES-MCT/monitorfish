ALTER TABLE reglementation_peche
    ADD COLUMN geometry_simplified public.geometry(Geometry, 4326);

CREATE OR REPLACE VIEW reglementation_peche_view AS
SELECT id,
       law_type,
       facade,
       layer_name,
       zones,
       region,
       date_fermeture,
       date_ouverture,
       periodes,
       engins,
       engins_interdits,
       mesures_techniques,
       especes,
       quantites,
       taille,
       especes_interdites,
       autre_reglementation_especes,
       documents_obligatoires,
       autre_reglementation,
       references_reglementaires,
       geometry_simplified,
       row_hash
FROM reglementation_peche;
ALTER TABLE reglementation_peche_view
    RENAME COLUMN geometry_simplified to geometry;
