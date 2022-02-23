DROP VIEW reglementation_peche_view;

ALTER TABLE public.reglementation_peche
    DROP COLUMN date_fermeture,
    DROP COLUMN date_ouverture,
    DROP COLUMN periodes,
    DROP COLUMN engins,
    DROP COLUMN engins_interdits,
    DROP COLUMN mesures_techniques,
    DROP COLUMN especes,
    DROP COLUMN quantites,
    DROP COLUMN taille,
    DROP COLUMN especes_interdites,
    DROP COLUMN autre_reglementation_especes,
    DROP COLUMN documents_obligatoires,
    DROP COLUMN autre_reglementation;

ALTER TABLE public.reglementation_peche
    RENAME COLUMN layer_name to topic;
ALTER TABLE public.reglementation_peche
    RENAME COLUMN zones to zone;
ALTER TABLE public.reglementation_peche
    RENAME COLUMN references_reglementaires to regulatory_references;

UPDATE public.reglementation_peche
    SET topic = REPLACE(topic, '_', ' ');

UPDATE public.reglementation_peche
    SET zone = REPLACE(topic, '_', ' ');
