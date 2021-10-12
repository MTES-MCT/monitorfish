package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import java.time.Instant

class VoyageInstantsAndTripNumber(var tripNumber: Int, var startDate: Instant, var endDate: Instant)
