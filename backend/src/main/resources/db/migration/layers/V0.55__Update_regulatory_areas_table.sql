DROP TABLE IF EXISTS public.all_decisions;
DROP TABLE IF EXISTS public.reglementation_peche;

CREATE TABLE public.reglementation_peche (
    id bigint PRIMARY KEY,
    law_type text,
    facade text,
    layer_name text,
    zones text,
    region text,
    date_fermeture timestamp without time zone,
    date_ouverture timestamp without time zone,
    periodes text,
    engins text,
    engins_interdits text,
    mesures_techniques text,
    especes text,
    quantites text,
    taille text,
    especes_interdites text,
    autre_reglementation_especes character varying,
    documents_obligatoires text,
    autre_reglementation character varying,
    references_reglementaires jsonb,
    geometry public.geometry(Geometry,4326)
);

CREATE INDEX idx_reglementation_peche_geometry ON public.reglementation_peche USING gist (geometry);
