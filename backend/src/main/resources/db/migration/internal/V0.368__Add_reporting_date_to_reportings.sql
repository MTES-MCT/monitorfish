ALTER TABLE reportings ADD COLUMN reporting_date TIMESTAMP WITH TIME ZONE;
UPDATE reportings SET reporting_date = creation_date;
ALTER TABLE reportings ALTER COLUMN reporting_date SET NOT NULL;
ALTER TABLE reportings ALTER COLUMN reporting_date SET DEFAULT now();
