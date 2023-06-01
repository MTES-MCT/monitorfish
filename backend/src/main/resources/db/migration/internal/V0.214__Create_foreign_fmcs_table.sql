CREATE TABLE public.foreign_fmcs (
    country_code_iso3 VARCHAR(3) PRIMARY KEY,
    country_name VARCHAR NOT NULL,
    email_addresses VARCHAR[]
);