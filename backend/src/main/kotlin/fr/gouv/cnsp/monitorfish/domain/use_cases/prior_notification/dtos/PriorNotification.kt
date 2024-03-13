package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripGear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookTripSegment
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel

data class PriorNotification(
    val id: Long,
    val logbookMessage: LogbookMessage?,
    // TODO It's only used for later use case resolution and not exposed in the data outpur. Maybe find a way to remove it from the DTO?
    val portLocode: String?,
    val reportingsCount: Int? = null,
    val tripGears: List<LogbookTripGear>,
    val tripSegments: List<LogbookTripSegment>,
    val port: Port? = null,
    val seaFront: String? = null,
    val vessel: Vessel? = null,
    val vesselRiskFactor: VesselRiskFactor? = null,
)
