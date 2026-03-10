SELECT DISTINCT cfr
FROM monitorfish.vms
WHERE
    date_time >= {from_datetime_utc:DateTime}
    AND cfr != 'NO_CFR'
ORDER BY 1