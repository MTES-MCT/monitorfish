CREATE TABLE "public"."neafc_regulatory_area" (
    "ogc_fid" SERIAL,
    wkb_geometry public.geometry(MultiPolygon,4326),
    CONSTRAINT "neafc_regulatory_area_pk" PRIMARY KEY ("ogc_fid"));

CREATE INDEX "neafc_regulatory_area_wkb_geometry_geom_idx" ON "public"."neafc_regulatory_area" USING GIST ("wkb_geometry");
