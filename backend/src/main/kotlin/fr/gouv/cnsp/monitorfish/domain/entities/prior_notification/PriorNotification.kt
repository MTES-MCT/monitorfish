package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.ConsolidatedLogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel

data class PriorNotification(
    val consolidatedLogbookMessage: ConsolidatedLogbookMessage<PNO>,
    val port: Port? = null,
    val reportingsCount: Int? = null,
    val seaFront: String? = null,
    val vessel: Vessel,
    val vesselRiskFactor: VesselRiskFactor?,
)
