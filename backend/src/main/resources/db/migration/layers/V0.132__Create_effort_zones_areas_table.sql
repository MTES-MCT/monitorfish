CREATE TABLE "public"."effort_zones_areas"
(
    "ogc_fid"    SERIAL,
    wkb_geometry public.geometry(MultiPolygon, 4326),
    zone         VARCHAR(254),
    CONSTRAINT "effort_zones_areas_pk" PRIMARY KEY ("ogc_fid")
);

CREATE INDEX "effort_zones_areas_wkb_geometry_geom_idx" ON "public"."effort_zones_areas" USING GIST ("wkb_geometry");
