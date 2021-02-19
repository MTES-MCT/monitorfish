package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import java.time.Instant

class LastDepartureInstantAndTripNumber(var lastDepartureDate: Instant, var tripNumber: Int? = null)
