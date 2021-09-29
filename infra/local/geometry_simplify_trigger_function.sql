UPDATE prod.reglementation_peche SET geometry_simplified = ST_Simplify(ST_CurveToLine(geometry), 0.001);

-- This trigger function
--   * is triggered whenever a row in the local regulation database is inserted or modified
--   * computes the simplified geometry (ST_Simplify) and store it in the geometry_simplified column
--
-- The trigger is BEFORE insert of update, so values always have an up-to-date simplified geometry.

DROP FUNCTION IF EXISTS prod.simplify_geometry CASCADE;

CREATE FUNCTION prod.simplify_geometry() RETURNS trigger AS $$
    BEGIN
        NEW.geometry_simplified := ST_Simplify(NEW.geometry, 0.001);
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER simplify_geometry
    BEFORE INSERT OR UPDATE ON prod.reglementation_peche
    FOR EACH ROW
    EXECUTE PROCEDURE prod.simplify_geometry();