package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import java.time.Instant

class VoyageDates(
    var startDate: Instant,
    var endDate: Instant,
)
