-- This trigger function
--   * is triggered whenever a row in the local regulation database is inserted or modified
--   * computes the md5 (hash) of the entire row and stores it in the `row_hash` column
--
-- The trigger is BEFORE insert of update, so values always have an up-to-date hash.

DROP FUNCTION IF EXISTS prod.compute_reglementation_md5 CASCADE;

CREATE FUNCTION prod.compute_reglementation_md5() RETURNS trigger AS $$
    BEGIN
        NEW.row_hash := md5(
			COALESCE(NEW.law_type::text, '') ||
			COALESCE(NEW.facade::text, '') ||
			COALESCE(NEW.layer_name::text, '') ||
			COALESCE(NEW.zones::text, '') ||
			COALESCE(NEW.region::text, '') ||
			COALESCE(NEW.date_fermeture::text, '') ||
			COALESCE(NEW.date_ouverture::text, '') ||
			COALESCE(NEW.periodes::text, '') ||
			COALESCE(NEW.engins::text, '') ||
			COALESCE(NEW.engins_interdits::text, '') ||
			COALESCE(NEW.mesures_techniques::text, '') ||
			COALESCE(NEW.especes::text, '') ||
			COALESCE(NEW.quantites::text, '') ||
			COALESCE(NEW.taille::text, '') ||
			COALESCE(NEW.especes_interdites::text, '') ||
			COALESCE(NEW.autre_reglementation_especes::text, '') ||
			COALESCE(NEW.documents_obligatoires::text, '') ||
			COALESCE(NEW.autre_reglementation::text, '') ||
			COALESCE(NEW.references_reglementaires::text, '') ||
			COALESCE(NEW.geometry::text, '')
		);
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compute_reglementation_md5
    BEFORE INSERT OR UPDATE ON prod.reglementation_peche
    FOR EACH ROW
    EXECUTE PROCEDURE prod.compute_reglementation_md5();