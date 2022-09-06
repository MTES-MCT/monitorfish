CREATE TABLE public.anchorages
(
    h3                           VARCHAR(20) PRIMARY KEY,
    ring_number                  SMALLINT    NOT NULL,
    cell_latitude                REAL        NOT NULL,
    cell_longitude               REAL        NOT NULL,
    nearest_port_distance        REAL        NOT NULL,
    nearest_port_locode          VARCHAR(10) NOT NULL,
    nearest_active_port_distance REAL        NOT NULL,
    nearest_active_port_locode   VARCHAR(10) NOT NULL
);
