CREATE TABLE user_layers (
    hashed_email varchar(200) PRIMARY KEY,
    administrative_layers JSONB NOT NULL,
    showed_regulatory_zone_ids JSONB NOT NULL,
    selected_regulatory_zone_ids JSONB NOT NULL,
    base_layer varchar(100)
);
