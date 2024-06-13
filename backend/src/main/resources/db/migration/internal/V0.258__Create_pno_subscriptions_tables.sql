-- Ports from which each control unit wants to receive PNOs
CREATE TABLE IF NOT EXISTS public.pno_ports_subscriptions (
    control_unit_id INTEGER NOT NULL,
    port_locode VARCHAR NOT NULL,
    receive_all_pnos BOOLEAN NOT NULL DEFAULT false,
    PRIMARY KEY (control_unit_id, port_locode)
);

-- Segments from which each control unit wants to reveive all PNOs
CREATE TABLE IF NOT EXISTS public.pno_segments_subscriptions (
    control_unit_id INTEGER NOT NULL,
    segment VARCHAR NOT NULL,
    PRIMARY KEY (control_unit_id, segment)
);

-- Vessels from which each control unit wants to reveive all PNOs
CREATE TABLE IF NOT EXISTS public.pno_vessels_subscriptions (
    control_unit_id INTEGER NOT NULL,
    cfr VARCHAR(12) NOT NULL,
    PRIMARY KEY (control_unit_id, cfr)
);
