CREATE TABLE vessels_risk_elements (
    risk_element_code VARCHAR NOT NULL REFERENCES risk_elements (code),
    cfr VARCHAR(12) NOT NULL,
    metrics JSONB NOT NULL,
    risk_level INTEGER NOT NULL,
    CONSTRAINT vessels_risk_elements_pkey PRIMARY KEY (cfr, risk_element_code)
);

CREATE INDEX vessels_risk_elements_cfr_key ON vessels_risk_elements(cfr);