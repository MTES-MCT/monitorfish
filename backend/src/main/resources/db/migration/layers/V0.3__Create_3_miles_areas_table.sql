DROP TABLE IF EXISTS "public"."3_miles_areas" CASCADE;
DELETE
FROM geometry_columns
WHERE f_table_name = '3_miles_areas'
  AND f_table_schema = 'public';
CREATE TABLE "public"."3_miles_areas"
(
    "ogc_fid" SERIAL,
    CONSTRAINT "3_miles_areas_pk" PRIMARY KEY ("ogc_fid")
);
SELECT AddGeometryColumn('public', '3_miles_areas', 'wkb_geometry', 4326, 'MULTILINESTRING', 2);
CREATE INDEX "3_miles_areas_wkb_geometry_geom_idx" ON "public"."3_miles_areas" USING GIST ("wkb_geometry");
COMMENT ON TABLE "public"."3_miles_areas" IS NULL;
ALTER TABLE "public"."3_miles_areas"
    ADD COLUMN "nature" VARCHAR(200);
ALTER TABLE "public"."3_miles_areas"
    ADD COLUMN "type" VARCHAR(200);
ALTER TABLE "public"."3_miles_areas"
    ADD COLUMN "descriptio" VARCHAR(200);
ALTER TABLE "public"."3_miles_areas"
    ADD COLUMN "beginlifes" VARCHAR(200);
ALTER TABLE "public"."3_miles_areas"
    ADD COLUMN "territory" VARCHAR(200);
ALTER TABLE "public"."3_miles_areas"
    ADD COLUMN "country" VARCHAR(200);
ALTER TABLE "public"."3_miles_areas"
    ADD COLUMN "agency" VARCHAR(200);
ALTER TABLE "public"."3_miles_areas"
    ADD COLUMN "inspireid" VARCHAR(200);
