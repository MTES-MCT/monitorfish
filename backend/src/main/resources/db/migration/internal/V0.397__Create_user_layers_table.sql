CREATE TABLE user_layers (
    hashed_email varchar(200) PRIMARY KEY,
    displayed_administrative_layers JSONB NOT NULL,
    displayed_regulatory_zone_ids JSONB NOT NULL,
    selected_regulatory_zone_ids JSONB NOT NULL,
    base_layer varchar(100)
);
