ALTER TABLE public.reglementation_peche
    ADD COLUMN references_reglementaires_old text,
    ADD COLUMN autre_reglementation          text,
    ADD COLUMN law_type                      text,
    ADD COLUMN autre_reglementation_especes  text;
