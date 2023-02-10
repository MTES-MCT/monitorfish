CREATE TABLE public.analytics_missions (
    id integer PRIMARY KEY,
    mission_type text,
    facade character varying(100),
    start_datetime_utc timestamp without time zone,
    end_datetime_utc timestamp without time zone,
    geom public.geometry(MultiPolygon,4326),
    mission_nature text[],
    deleted boolean NOT NULL,
    mission_source text NOT NULL,
    closed boolean NOT NULL,
    mission_order boolean
);

CREATE INDEX analytics_missions_deleted_idx ON public.analytics_missions USING btree (deleted);
CREATE INDEX analytics_missions_geom_sidx ON public.analytics_missions USING gist (geom);
CREATE INDEX analytics_missions_start_datetime_utc_idx ON public.analytics_missions USING btree (start_datetime_utc DESC);


CREATE TABLE public.analytics_missions_control_units (
    id integer PRIMARY KEY,
    mission_id integer NOT NULL,
    control_unit_id integer NOT NULL
);

ALTER TABLE public.analytics_missions_control_units
    ADD CONSTRAINT analytics_missions_control_units_control_unit_id_fkey 
    FOREIGN KEY (control_unit_id) REFERENCES public.analytics_control_units(id);

ALTER TABLE public.analytics_missions_control_units
    ADD CONSTRAINT analytics_missions_control_units_mission_id_fkey 
    FOREIGN KEY (mission_id) REFERENCES public.analytics_missions(id);
