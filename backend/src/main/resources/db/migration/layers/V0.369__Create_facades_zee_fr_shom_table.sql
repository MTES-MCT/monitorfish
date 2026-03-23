CREATE TABLE facades_zee_fr_shom (
    id integer NOT NULL,
    geom public.geometry(MultiPolygon,4326),
    fid integer,
    zone character varying(80),
    type character varying(50),
    typezone character varying(41),
    nom_court character varying
);
