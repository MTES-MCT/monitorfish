-- This trigger function
--   * is triggered whenever a row in the local regulation database is inserted or modified
--   * computes the md5 (hash) of the entire row and stores it in the `row_hash` column
--
-- The trigger is BEFORE insert of update, so values always have an up-to-date hash.

DROP FUNCTION IF EXISTS prod.compute_reglementation_md5 CASCADE;

CREATE FUNCTION prod.compute_regulations_md5() RETURNS trigger AS $$
BEGIN
    NEW.row_hash := md5(
        COALESCE(NEW.law_type::text, '') ||
        COALESCE(NEW.topic::text, '') ||
        COALESCE(NEW.zone::text, '') ||
        COALESCE(NEW.region::text, '') ||
        COALESCE(NEW.other_info::text, '') ||
        COALESCE(NEW.fishing_period::text, '') ||
        COALESCE(NEW.species::text, '') ||
        COALESCE(NEW.gears::text, '') ||
        COALESCE(NEW.regulatory_references::text, '') ||
        COALESCE(NEW.geometry::text, '')  ||
        COALESCE(NEW.next_id::text, '')
        );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compute_regulations_md5
    BEFORE INSERT OR UPDATE ON prod.regulations
    FOR EACH ROW
EXECUTE PROCEDURE prod.compute_regulations_md5();
