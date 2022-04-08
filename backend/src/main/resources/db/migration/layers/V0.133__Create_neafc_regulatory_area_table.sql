CREATE TABLE "public"."neafc_regulatory_area" (
    "ogc_fid" SERIAL,
    CONSTRAINT "neafc_regulatory_area_pk" PRIMARY KEY ("ogc_fid"));
SELECT AddGeometryColumn('public','neafc_regulatory_area','wkb_geometry',4326,'MULTIPOLYGON',2);

CREATE INDEX "neafc_regulatory_area_wkb_geometry_geom_idx" ON "public"."neafc_regulatory_area" USING GIST ("wkb_geometry");
