DELETE FROM beacon_malfunctions;
DELETE FROM beacon_malfunction_actions;
DELETE FROM beacon_malfunction_comments;
DELETE FROM beacon_malfunction_notifications;

ALTER TABLE beacon_malfunctions
    DROP COLUMN priority,
    DROP COLUMN end_of_malfunction_reason,
    ADD COLUMN beacon_number character varying(100) NOT NULL,
    ADD COLUMN beacon_status_at_malfunction_creation public.beacon_status NOT NULL;

-- Enum must be dropped and recreated as it is not possible to remove values from an enum.
DROP TYPE public.beacon_malfunctions_end_of_malfunction_reason;
CREATE TYPE public.beacon_malfunctions_end_of_malfunction_reason
AS ENUM (
    'RESUMED_TRANSMISSION',
    'BEACON_DEACTIVATED_OR_UNEQUIPPED'
);

-- Re-add the end_of_malfunction_reason column with the modified type.
ALTER TABLE beacon_malfunctions
ADD COLUMN end_of_malfunction_reason public.beacon_malfunctions_end_of_malfunction_reason;
