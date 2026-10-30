INSERT INTO vessels_risk_elements (
    risk_element_code, cfr, metrics, risk_level
) VALUES
    (
        'MOT_MR', 'FAK000999999',
        '{"totalTrips": 4, "compliantTrips": 2, "shareOfNonCompliantTrips": 0.5, "nonCompliantTrips": [{"tripNumber": "9463714", "startDateTimeUtc": "2019-02-17T01:05:00Z", "endDateTimeUtc": "2020-08-09T13:47:00Z"}, {"tripNumber": "9463715", "startDateTimeUtc": "2019-10-11T01:40:00Z", "endDateTimeUtc": "2019-10-11T01:40:00Z"}]}',
        4
    ),
    (
        'PNO_MR', 'FAK000999999',
        '{"totalTrips": 10, "compliantTrips": 9, "shareOfNonCompliantTrips": 0.1, "nonCompliantTrips": [{"tripNumber": "9463713", "startDateTimeUtc": null, "endDateTimeUtc": null}]}',
        1
    ),
    (
        'CLA_CM', 'ABC000180832',
        '{"occurrences": 3, "reportingIds": [1, 2, 3]}',
        3
    ),
    (
        'VMS_MR', 'ABC000180832',
        '{"occurrences": 0}',
        1
    );
