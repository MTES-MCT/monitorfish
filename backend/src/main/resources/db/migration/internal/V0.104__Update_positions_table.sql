ALTER TABLE public.positions
    ADD COLUMN geometry public.geometry(Point, 4326),
    ADD COLUMN is_at_port BOOLEAN,
    ADD COLUMN meters_from_previous_position REAL,
    ADD COLUMN time_since_previous_position INTERVAL,
    ADD COLUMN average_speed REAL,
    ADD COLUMN is_fishing BOOLEAN;

CREATE INDEX positions_geometry_idx ON positions USING gist (geometry);

UPDATE public.positions
SET geometry = ST_SetSRID(St_MakePoint(longitude, latitude), 4326);

CREATE FUNCTION public.create_position_geometry() RETURNS trigger AS $$
    BEGIN
        NEW.geometry := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_position_geometry
    BEFORE INSERT OR UPDATE ON public.positions
    FOR EACH ROW
    EXECUTE PROCEDURE public.create_position_geometry();
