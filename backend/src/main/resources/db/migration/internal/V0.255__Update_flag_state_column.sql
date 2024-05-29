-- We now store `UNDEFINED` from `com.neovisionaries.i18n.CountryCode` library

ALTER TABLE pending_alerts
    ALTER COLUMN flag_state SET DATA TYPE varchar(10);

ALTER TABLE silenced_alerts
    ALTER COLUMN flag_state SET DATA TYPE varchar(10);

ALTER TABLE reportings
    ALTER COLUMN flag_state SET DATA TYPE varchar(10);
