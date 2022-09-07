CREATE TABLE  if not exists public.ers_messages (
    operation_number character varying(17),
    operation_country character varying(3),
    operation_datetime_utc timestamp,
    operation_type character varying(3),
    ers_id character varying(17),
    ers_id_to_delete_or_correct character varying(17),
    ers_datetime_utc timestamp,
    cfr character varying(12),
    ircs character varying(7),
    external_identification character varying(14),
    vessel_name character varying(100),
    flag_state character varying(3),
    imo character varying(20),
    xml_message text,
    raw_integration_datetime_utc timestamp,
    parsed_integration_datetime_utc timestamp);

ALTER TABLE public.ers_messages DROP CONSTRAINT IF EXISTS ers_messages_pkey;
ALTER TABLE ONLY public.ers_messages ADD CONSTRAINT ers_messages_pkey PRIMARY KEY (operation_number);
CREATE INDEX ON public.ers_messages (operation_number);
CREATE INDEX ON public.ers_messages (cfr);
CREATE INDEX ON public.ers_messages (ircs);
CREATE INDEX ON public.ers_messages (operation_datetime_utc);

CREATE SEQUENCE IF NOT EXISTS ers_id_seq START 1;

CREATE TABLE  if not exists public.ers (
    id integer DEFAULT nextval('ers_id_seq'),
    operation_number character varying(17) REFERENCES public.ers_messages,
    operation_country character varying(3),
    operation_datetime_utc timestamp,
    operation_type character varying(3),
    ers_id character varying(17),
    ers_id_to_delete_or_correct character varying(17),
    ers_datetime_utc timestamp,
    cfr character varying(12),
    ircs character varying(7),
    external_identification character varying(14),
    vessel_name character varying(100),
    flag_state character varying(3),
    imo character varying(20),
    log_type character varying(3),
    value jsonb,
    parsed_integration_datetime_utc timestamp);

ALTER TABLE public.ers DROP CONSTRAINT IF EXISTS ers_pkey;
ALTER TABLE ONLY public.ers ADD CONSTRAINT ers_pkey PRIMARY KEY (id);
CREATE INDEX ON public.ers (id);
CREATE INDEX ON public.ers (cfr);
CREATE INDEX ON public.ers (ircs);
CREATE INDEX ON public.ers (log_type);
CREATE INDEX ON public.ers (operation_datetime_utc);


