create table public.producer_organization_memberships (
    internal_reference_number VARCHAR PRIMARY KEY,
    start_membership_date VARCHAR NOT NULL,
    organization_name VARCHAR NOT NULL
);
