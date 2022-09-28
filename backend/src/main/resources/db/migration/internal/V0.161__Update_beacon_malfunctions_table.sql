DELETE FROM beacon_malfunctions;
DELETE FROM beacon_malfunction_actions;
DELETE FROM beacon_malfunction_comments;
DELETE FROM beacon_malfunction_notifications;

ALTER TABLE beacon_malfunctions
ADD COLUMN beacon_number character varying(100) NOT NULL;