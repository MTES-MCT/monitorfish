package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification.dtos.PriorNotification

class PriorNotificationDataOutput(
    val id: Long,
    val logbookMessage: LogbookMessageDataOutput?,
    val port: PortDataOutput?,
    val reportingsCount: Int,
    val seaFront: String?,
    val tripGears: List<LogbookMessageTripGearDataOutput>,
    val tripSegments: List<LogbookMessageTripSegmentDataOutput>,
    val vessel: VesselDataOutput?,
    val vesselRiskFactor: RiskFactorDataOutput?,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDataOutput {
            val logbookMessage =
                priorNotification.logbookMessage?.let {
                    LogbookMessageDataOutput.fromLogbookMessage(
                        it,
                    )
                }
            val port = priorNotification.port?.let { PortDataOutput.fromPort(it) }
            val tripGears =
                priorNotification.tripGears.map { LogbookMessageTripGearDataOutput.fromLogbookTripGear(it) }
            val tripSegments =
                priorNotification.tripSegments.map { LogbookMessageTripSegmentDataOutput.fromLogbookTripSegment(it) }
            val vessel = priorNotification.vessel?.let { VesselDataOutput.fromVessel(it) }
            val vesselRiskFactor =
                priorNotification.vesselRiskFactor?.let {
                    RiskFactorDataOutput.fromVesselRiskFactor(
                        it,
                    )
                }

            return PriorNotificationDataOutput(
                id = priorNotification.id,
                logbookMessage,
                port,
                reportingsCount = requireNotNull(priorNotification.reportingsCount),
                seaFront = priorNotification.seaFront,
                tripGears,
                tripSegments,
                vessel,
                vesselRiskFactor,
            )
        }
    }
}
