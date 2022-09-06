DROP TABLE IF EXISTS "public"."fao_areas" CASCADE;
DELETE
FROM geometry_columns
WHERE f_table_name = 'fao_areas'
  AND f_table_schema = 'public';
CREATE TABLE "public"."fao_areas"
(
    "ogc_fid" SERIAL,
    CONSTRAINT "fao_areas_pk" PRIMARY KEY ("ogc_fid")
);
SELECT AddGeometryColumn('public', 'fao_areas', 'wkb_geometry', 32631, 'MULTIPOLYGON', 2);
CREATE INDEX "fao_areas_wkb_geometry_geom_idx" ON "public"."fao_areas" USING GIST ("wkb_geometry");
COMMENT ON TABLE "public"."fao_areas" IS NULL;
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "fid" NUMERIC(33, 15);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "f_code" VARCHAR(254);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "f_level" VARCHAR(254);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "f_status" NUMERIC(33, 15);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "ocean" VARCHAR(254);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "subocean" VARCHAR(254);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "f_area" VARCHAR(254);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "f_subarea" VARCHAR(254);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "f_division" VARCHAR(254);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "f_subdivis" VARCHAR(254);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "f_subunit" VARCHAR(254);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "id" NUMERIC(33, 15);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "name_en" VARCHAR(254);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "name_fr" VARCHAR(254);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "name_es" VARCHAR(254);
ALTER TABLE "public"."fao_areas"
    ADD COLUMN "surface" NUMERIC(33, 15);
