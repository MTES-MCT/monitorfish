create table public.satellite_operators (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    emails VARCHAR[]
);
