CREATE INDEX ers_cfr_trip_number_idx ON ers (
                                             cfr,
                                             trip_number,
                                             operation_datetime_utc DESC
    ) WHERE operation_type IN ('DAT', 'COR');

CREATE INDEX ers_del_referenced_ers_id_idx ON ers (
                                                   referenced_ers_id,
                                                   operation_datetime_utc DESC
    ) WHERE operation_type = 'DEL';

CREATE INDEX ers_ret_referenced_ers_id_idx ON ers (
                                                   referenced_ers_id,
                                                   operation_datetime_utc DESC
    ) WHERE operation_type = 'RET';

CREATE INDEX ers_missing_trip_numbers ON ers (
                                              operation_datetime_utc DESC
    ) WHERE
        operation_type IN ('DAT', 'COR') AND
        trip_number IS NULL;
