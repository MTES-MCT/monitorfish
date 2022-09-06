CREATE TABLE "public"."navigation_category_two_areas"
(
    "ogc_fid" SERIAL,
    CONSTRAINT "navigation_category_two_areas_pk" PRIMARY KEY ("ogc_fid")
);
SELECT AddGeometryColumn('public', 'navigation_category_two_areas', 'wkb_geometry', 3857, 'MULTILINESTRING', 2);
CREATE INDEX "navigation_category_two_areas_wkb_geometry_geom_idx" ON "public"."navigation_category_two_areas" USING GIST ("wkb_geometry");
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "gm_layer" VARCHAR(25);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "gm_type" VARCHAR(17);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "layer" VARCHAR(21);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "cst" VARCHAR(254);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "toponyme" VARCHAR(254);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "lon" VARCHAR(254);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "lat" VARCHAR(254);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "ut" NUMERIC(9, 6);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "ut_sup" NUMERIC(9, 6);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "baie_de_se" VARCHAR(17);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "pays" VARCHAR(6);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "coeff" VARCHAR(17);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "official" NUMERIC(8, 6);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "annuaires" VARCHAR(3);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "calmar" VARCHAR(11);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "shomar" VARCHAR(7);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "appli_mobi" VARCHAR(3);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "ram" VARCHAR(3);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "service" VARCHAR(3);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "obs" VARCHAR(3);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "perimeter" VARCHAR(9);
ALTER TABLE "public"."navigation_category_two_areas"
    ADD COLUMN "enclosed_a" VARCHAR(13);

CREATE TABLE "public"."navigation_category_three_areas"
(
    "ogc_fid" SERIAL,
    CONSTRAINT "navigation_category_three_areas_pk" PRIMARY KEY ("ogc_fid")
);
SELECT AddGeometryColumn('public', 'navigation_category_three_areas', 'wkb_geometry', 3857, 'MULTILINESTRING', 2);
CREATE INDEX "navigation_category_three_areas_wkb_geometry_geom_idx" ON "public"."navigation_category_three_areas" USING GIST ("wkb_geometry");
ALTER TABLE "public"."navigation_category_three_areas"
    ADD COLUMN "gm_layer" VARCHAR(17);
ALTER TABLE "public"."navigation_category_three_areas"
    ADD COLUMN "gm_type" VARCHAR(19);
ALTER TABLE "public"."navigation_category_three_areas"
    ADD COLUMN "layer" VARCHAR(17);
ALTER TABLE "public"."navigation_category_three_areas"
    ADD COLUMN "id" NUMERIC(6, 0);

CREATE TABLE "public"."navigation_category_four_areas"
(
    "ogc_fid" SERIAL,
    CONSTRAINT "navigation_category_four_areas_pk" PRIMARY KEY ("ogc_fid")
);
SELECT AddGeometryColumn('public', 'navigation_category_four_areas', 'wkb_geometry', 3857, 'MULTILINESTRING', 2);
CREATE INDEX "navigation_category_four_areas_wkb_geometry_geom_idx" ON "public"."navigation_category_four_areas" USING GIST ("wkb_geometry");
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "gm_layer" VARCHAR(21);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "gm_type" VARCHAR(21);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "layer" VARCHAR(21);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "cst" VARCHAR(254);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "toponyme" VARCHAR(254);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "lon" VARCHAR(254);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "lat" VARCHAR(79);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "ut" NUMERIC(9, 6);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "ut_sup" NUMERIC(9, 6);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "baie_de_se" NUMERIC(8, 6);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "pays" VARCHAR(6);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "coeff" VARCHAR(17);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "official" VARCHAR(17);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "annuaires" VARCHAR(3);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "calmar" VARCHAR(7);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "shomar" VARCHAR(7);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "appli_mobi" VARCHAR(3);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "ram" VARCHAR(3);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "service" VARCHAR(3);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "obs" VARCHAR(3);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "perimeter" VARCHAR(9);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "enclosed_a" VARCHAR(12);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "name" VARCHAR(33);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "length" VARCHAR(254);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "bearing" VARCHAR(254);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "limite" VARCHAR(254);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "observatio" VARCHAR(254);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "cartemarin" VARCHAR(97);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "enclosed_1" VARCHAR(1);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "enclosed_2" VARCHAR(26);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "enclosed_3" VARCHAR(75);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "island_are" VARCHAR(7);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "typep" VARCHAR(3);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "enclosed_4" VARCHAR(12);
ALTER TABLE "public"."navigation_category_four_areas"
    ADD COLUMN "enclosed_5" VARCHAR(12);

CREATE TABLE "public"."navigation_category_five_areas"
(
    "ogc_fid" SERIAL,
    CONSTRAINT "navigation_category_five_areas_pk" PRIMARY KEY ("ogc_fid")
);
SELECT AddGeometryColumn('public', 'navigation_category_five_areas', 'wkb_geometry', 3857, 'MULTILINESTRING', 2);
CREATE INDEX "navigation_category_five_areas_wkb_geometry_geom_idx" ON "public"."navigation_category_five_areas" USING GIST ("wkb_geometry");
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "gm_layer" VARCHAR(17);
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "gm_type" VARCHAR(17);
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "name" VARCHAR(52);
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "layer" VARCHAR(17);
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "length" VARCHAR(9);
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "bearing" VARCHAR(12);
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "limite" VARCHAR(200);
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "observatio" VARCHAR(254);
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "cartemarin" VARCHAR(25);
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "enclosed_a" VARCHAR(13);
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "enclosed_1" VARCHAR(13);
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "enclosed_2" VARCHAR(13);
ALTER TABLE "public"."navigation_category_five_areas"
    ADD COLUMN "enclosed_3" VARCHAR(13);
