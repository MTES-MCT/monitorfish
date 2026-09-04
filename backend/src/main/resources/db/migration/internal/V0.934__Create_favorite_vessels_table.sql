CREATE TABLE favorite_vessels (
    hashed_email varchar(200) PRIMARY KEY,
    vessels JSONB NOT NULL
);

CREATE INDEX ON public.favorite_vessels(hashed_email);
