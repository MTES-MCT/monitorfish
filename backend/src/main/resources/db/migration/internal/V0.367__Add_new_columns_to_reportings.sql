ALTER TABLE reportings ADD COLUMN mmsi VARCHAR;
ALTER TABLE reportings ADD COLUMN imo VARCHAR;
ALTER TABLE reportings ADD COLUMN length DOUBLE PRECISION;
ALTER TABLE reportings ADD COLUMN gear_code VARCHAR;
ALTER TABLE reportings ADD COLUMN is_fishing BOOLEAN;

ALTER TABLE reportings ADD COLUMN last_update_date_utc TIMESTAMP WITH TIME ZONE;
UPDATE reportings SET last_update_date_utc = creation_date;
ALTER TABLE reportings ALTER COLUMN last_update_date_utc SET NOT NULL;
ALTER TABLE reportings ALTER COLUMN last_update_date_utc SET DEFAULT now();

ALTER TABLE reportings ADD COLUMN reporting_date TIMESTAMP WITH TIME ZONE;
UPDATE reportings SET reporting_date = creation_date;
ALTER TABLE reportings ALTER COLUMN reporting_date SET NOT NULL;
ALTER TABLE reportings ALTER COLUMN reporting_date SET DEFAULT now();
