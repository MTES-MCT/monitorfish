ALTER TYPE logbook_message_transmission_format RENAME TO data_transmission_format;

CREATE TABLE public.sales_notes_raw_messages (
    operation_number VARCHAR NOT NULL,
    xml_message text
);

CREATE INDEX ON public.sales_notes_raw_messages (operation_number);

CREATE TABLE sales_notes (
    operation_number VARCHAR NOT NULL,
    operation_country VARCHAR,
    operation_datetime_utc TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    operation_type VARCHAR NOT NULL,
    report_id VARCHAR NOT NULL,
    referenced_report_id VARCHAR,
    report_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    cfr VARCHAR,
    ircs VARCHAR,
    external_identification VARCHAR,
    vessel_name VARCHAR,
    flag_state VARCHAR,
    imo VARCHAR,
    sales_type VARCHAR,
    products JSONB,
    integration_datetime_utc TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    sender_id VARCHAR,
    sender_name VARCHAR,
    provider_id VARCHAR,
    provider_name VARCHAR,
    buyer_id VARCHAR,
    buyer_name VARCHAR,
    recipient_id VARCHAR,
    recipient_name VARCHAR,
    carrier_id VARCHAR,
    carrier_name VARCHAR,
    sales_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    sales_country VARCHAR,
    sales_port_code VARCHAR,
    sales_contract_reference VARCHAR,
    bcd_number VARCHAR,
    takeover_organization_name VARCHAR,
    storage_facility_name VARCHAR,
    storage_facility_address VARCHAR,
    transport_document_reference VARCHAR,
    invoice_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    invoice_number VARCHAR,
    takeover_contract_reference VARCHAR,
    trip_number VARCHAR,
    sales_id VARCHAR,
    landing_port_code VARCHAR,
    departure_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    landing_datetime_utc TIMESTAMP WITHOUT TIME ZONE,
    transmission_format data_transmission_format NOT NULL
);

SELECT create_hypertable('sales_notes', by_range('operation_datetime_utc', INTERVAL '1 week'));