DROP TABLE IF EXISTS public.legipeche;
DROP TYPE IF EXISTS public.legipeche_extraction_occurence;

CREATE TYPE public.legipeche_extraction_occurence AS ENUM ('latest', 'previous');

CREATE TABLE public.legipeche
(
    extraction_datetime_utc TIMESTAMP                      NOT NULL,
    extraction_occurence    legipeche_extraction_occurence NOT NULL,
    page_title              VARCHAR                        NOT NULL,
    page_url                VARCHAR                        NOT NULL,
    document_title          VARCHAR,
    document_url            VARCHAR
);
