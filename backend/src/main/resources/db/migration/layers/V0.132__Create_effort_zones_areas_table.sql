CREATE TABLE "public"."effort_zones_areas" (
    "ogc_fid" SERIAL,
    CONSTRAINT "effort_zones_areas_pk" PRIMARY KEY ("ogc_fid"));
SELECT AddGeometryColumn('public','effort_zones_areas','wkb_geometry',4326,'MULTIPOLYGON',2);
ALTER TABLE "public"."effort_zones_areas" ADD COLUMN "zone" VARCHAR(254);

CREATE INDEX "effort_zones_areas_wkb_geometry_geom_idx" ON "public"."effort_zones_areas" USING GIST ("wkb_geometry");
