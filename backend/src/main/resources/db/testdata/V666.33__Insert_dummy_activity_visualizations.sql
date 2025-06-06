COPY public.activity_visualizations (
    start_datetime_utc,
    end_datetime_utc,
    html_file
)
FROM '/testdata/csv/dummy_activity_visualizations.csv'
(FORMAT CSV, DELIMITER ',', HEADER);
