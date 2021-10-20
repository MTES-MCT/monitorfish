package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import java.time.Instant

class VoyageTripNumberAndDate(var tripNumber: Int, var startOrEndDate: Instant)

class VoyageTripNumberAndDates(var tripNumber: Int, var startDate: Instant, var endDate: Instant)

class VoyageDates(var startDate: Instant, var endDate: Instant)
