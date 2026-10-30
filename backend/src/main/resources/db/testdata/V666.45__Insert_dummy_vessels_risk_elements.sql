INSERT INTO vessels_risk_elements (
    risk_element_code, cfr, metrics, risk_level
) VALUES
    (
        'MOT_MR', 'FAK000999999',
        '{"total_trips": 4, "compliant_trips": 2, "share_of_non_compliant_trips": 0.5, "non_compliant_trips": [{"trip_number": "9463714", "start_datetime_utc": "2019-02-17T01:05:00Z", "end_datetime_utc": "2020-08-09T13:47:00Z"}, {"trip_number": "9463715", "start_datetime_utc": "2019-10-11T01:40:00Z", "end_datetime_utc": "2019-10-11T01:40:00Z"}]}',
        4
    ),
    (
        'PNO_MR', 'FAK000999999',
        '{"total_trips": 10, "compliant_trips": 9, "share_of_non_compliant_trips": 0.1, "non_compliant_trips": [{"trip_number": "9463713", "start_datetime_utc": null, "end_datetime_utc": null}]}',
        1
    ),
    (
        'CLA_CM', 'ABC000180832',
        '{"occurrences": 3, "reporting_ids": [1, 2, 3]}',
        3
    ),
    (
        'VMS_MR', 'ABC000180832',
        '{"occurrences": 0, "beacon_malfunction_ids": []}',
        1
    );
