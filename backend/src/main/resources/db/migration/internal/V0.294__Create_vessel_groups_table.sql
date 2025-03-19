CREATE TABLE vessel_groups (
    id SERIAL PRIMARY KEY,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    points_of_attention VARCHAR(255),
    color VARCHAR(7) NOT NULL,
    filters JSONB NOT NULL,
    sharing VARCHAR(255) NOT NULL,
    type VARCHAR(255) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_at_utc TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at_utc TIMESTAMP WITH TIME ZONE,
    end_of_validity_utc TIMESTAMP WITH TIME ZONE
);

CREATE INDEX ON vessel_groups (created_by);
CREATE INDEX ON vessel_groups (created_by, is_deleted);
