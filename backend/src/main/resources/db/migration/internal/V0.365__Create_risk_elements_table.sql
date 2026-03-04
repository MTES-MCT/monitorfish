CREATE TABLE risk_elements (
    code VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    threat_characterization_id INTEGER NOT NULL REFERENCES threat_characterizations (id)
);