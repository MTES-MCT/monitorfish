-- Port subscriptions for which recipients other than control units need to receive PNOs
CREATE TABLE IF NOT EXISTS public.pno_extra_subscriptions (
    pno_type_name VARCHAR NOT NULL,
    port_locode VARCHAR NOT NULL,
    recipient_name VARCHAR NOT NULL,
    recipient_organization VARCHAR NOT NULL,
    communication_means communication_means NOT NULL,
    recipient_email_address_or_number VARCHAR NOT NULL
);
