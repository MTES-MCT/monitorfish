ALTER TABLE public.reglementation_peche
    ADD COLUMN next_id bigint;

DROP VIEW reglementation_peche_view;

CREATE OR REPLACE VIEW reglementation_peche_view AS
SELECT id,
       law_type,
       facade,
       layer_name,
       zones,
       region,
       date_fermeture,
       date_ouverture,
       fishing_period,
       periodes,
       engins,
       engins_interdits,
       mesures_techniques,
       especes,
       species,
       gears,
       quantites,
       taille,
       especes_interdites,
       autre_reglementation_especes,
       documents_obligatoires,
       autre_reglementation,
       references_reglementaires,
       geometry_simplified,
       row_hash,
       next_id
FROM reglementation_peche;
ALTER TABLE reglementation_peche_view
    RENAME COLUMN geometry_simplified to geometry;
