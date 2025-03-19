package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import java.time.Instant

class VoyageTripNumberAndDate(
    var tripNumber: String,
    var startOrEndDate: Instant,
)

class VoyageTripNumberAndDates(
    var tripNumber: String,
    var startDate: Instant,
    var endDate: Instant,
    var endDateWithoutLAN: Instant? = null,
)

class VoyageDates(
    var startDate: Instant,
    var endDate: Instant,
    var endDateWithoutLAN: Instant? = null,
)
