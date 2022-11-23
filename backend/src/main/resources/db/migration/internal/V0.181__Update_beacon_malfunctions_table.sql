-- Re-create ENUM without 'NEVER_EMITTED' value
CREATE TYPE beacon_malfunctions_vessel_status_new AS ENUM (
    'AT_SEA',
    'AT_PORT',
    'ON_SALE',
    'SUSPENDED_BECAUSE_UNPAID',
    'IN_FOREIGN_EEZ',
    'NO_NEWS',
    'TECHNICAL_STOP',
    'ACTIVITY_DETECTED'
);

-- Convert to new type, casting via text representation
ALTER TABLE beacon_malfunctions
  ALTER COLUMN vessel_status TYPE beacon_malfunctions_vessel_status_new
    USING (vessel_status::text::beacon_malfunctions_vessel_status_new);

-- and swap the types
DROP TYPE beacon_malfunctions_vessel_status;
ALTER TYPE beacon_malfunctions_vessel_status_new RENAME TO beacon_malfunctions_vessel_status;




