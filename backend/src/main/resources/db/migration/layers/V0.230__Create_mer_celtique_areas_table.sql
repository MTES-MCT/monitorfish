DROP TABLE IF EXISTS "public"."1241_mer_celtique_areas" CASCADE;

CREATE TABLE "public"."1241_mer_celtique_areas"
(
    "ogc_fid" SERIAL,
    CONSTRAINT "1241_mer_celtique_areas_pk" PRIMARY KEY ("ogc_fid")
);

SELECT AddGeometryColumn('public', '1241_mer_celtique_areas', 'wkb_geometry', 4326, 'MULTIPOLYGON', 2);

CREATE INDEX "1241_mer_celtique_areas_wkb_geometry_geom_idx" ON "public"."1241_mer_celtique_areas" USING GIST ("wkb_geometry");
