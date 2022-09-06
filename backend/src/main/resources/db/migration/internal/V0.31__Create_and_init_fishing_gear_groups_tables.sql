-- Liste of fishing gear groups
CREATE TABLE public.fishing_gear_groups
(
    id                 SERIAL PRIMARY KEY,
    fishing_gear_group VARCHAR NOT NULL
);

INSERT INTO public.fishing_gear_groups
VALUES (1, 'Engins traînants'),
       (2, 'Engins dormants');

-- Many-to-many relation between fishing gears and fishing gear groups
CREATE TABLE public.fishing_gear_codes_groups
(
    fishing_gear_code     VARCHAR NOT NULL,
    fishing_gear_group_id INTEGER REFERENCES public.fishing_gear_groups ON DELETE CASCADE
);

CREATE INDEX ON public.fishing_gear_codes_groups (fishing_gear_code);

INSERT INTO public.fishing_gear_codes_groups
VALUES ('TMS', 1),
       ('TM', 1),
       ('TMB', 1),
       ('TX', 1),
       ('PT', 1),
       ('OT', 1),
       ('TB', 1),
       ('TBS', 1),
       ('TBN', 1),
       ('OTT', 1),
       ('PTM', 1),
       ('OTM', 1),
       ('PTB', 1),
       ('OTB', 1),
       ('TBB', 1),
       ('OTP', 1),
       ('HMD', 1),
       ('DRB', 1),
       ('DRM', 1),
       ('SSC', 1),
       ('SDN', 1),
       ('GNF', 2),
       ('GEN', 2),
       ('GN', 2),
       ('GTN', 2),
       ('GTR', 2),
       ('GNC', 2),
       ('GND', 2),
       ('GNS', 2),
       ('LNP', 2),
       ('LN', 2),
       ('GES', 2),
       ('LNS', 2),
       ('LNB', 2),
       ('LA', 2),
       ('PS', 2),
       ('SUX', 2),
       ('LVS', 2),
       ('LVD', 2),
       ('LX', 2),
       ('LTL', 2),
       ('LLD', 2),
       ('LLS', 2),
       ('LHM', 2),
       ('LHP', 2),
       ('FYK', 2),
       ('FWR', 2),
       ('FSN', 2),
       ('FPN', 2),
       ('FAR', 2),
       ('FAG', 2),
       ('LL', 2),
       ('FIX', 2),
       ('FPO', 2);
