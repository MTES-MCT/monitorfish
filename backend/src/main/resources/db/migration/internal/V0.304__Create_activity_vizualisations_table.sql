CREATE TABLE activity_visualizations (
    start_datetime_utc TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_datetime_utc TIMESTAMP WITHOUT TIME ZONE NOT NULL PRIMARY KEY,
    html_file BYTEA
)
