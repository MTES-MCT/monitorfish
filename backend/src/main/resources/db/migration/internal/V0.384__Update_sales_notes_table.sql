CREATE INDEX ON sales_notes (referenced_report_id, operation_datetime_utc DESC) WHERE operation_type = 'COR';
CREATE INDEX ON sales_notes (referenced_report_id, operation_datetime_utc DESC) WHERE operation_type = 'DEL';
CREATE INDEX ON sales_notes (report_id, operation_datetime_utc DESC) WHERE operation_type IN ('DAT', 'COR');