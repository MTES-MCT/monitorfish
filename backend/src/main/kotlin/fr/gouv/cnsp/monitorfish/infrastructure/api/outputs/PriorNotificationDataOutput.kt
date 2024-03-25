package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification

class PriorNotificationDataOutput(
    val id: Long,
    val expectedArrivalDate: String?,
    val expectedLandingDate: String?,
    val notificationTypeLabel: String?,
    val onBoardCatches: List<LogbookMessageCatchDataOutput>,
    val portLocode: String?,
    val portName: String?,
    val purposeCode: String?,
    val reportingsCount: Int?,
    val seaFront: String?,
    val sentAt: String?,
    val tripGears: List<LogbookMessageTripGearDataOutput>,
    val tripSegments: List<LogbookMessageTripSegmentDataOutput>,
    val types: List<PriorNotificationTypeDataOutput>,
    val vessel: VesselDataOutput,
    val vesselLastControlDate: String?,
    val vesselRiskFactorImpact: Double?,
    val vesselRiskFactorProbability: Double?,
    val vesselRiskFactorDetectability: Double?,
    val vesselRiskFactor: Double?,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDataOutput {
            val onBoardCatches = priorNotification.onboardCatches.map { LogbookMessageCatchDataOutput.fromCatch(it) }
            val tripGears = priorNotification.tripGears.map { LogbookMessageTripGearDataOutput.fromLogbookTripGear(it) }
            val tripSegments =
                priorNotification.tripSegments.map {
                    LogbookMessageTripSegmentDataOutput.fromLogbookTripSegment(
                        it,
                    )
                }
            val types = priorNotification.types.map { PriorNotificationTypeDataOutput.fromPriorNotificationType(it) }

            return PriorNotificationDataOutput(
                id = priorNotification.id,
                expectedArrivalDate = priorNotification.expectedArrivalDate,
                expectedLandingDate = priorNotification.expectedLandingDate,
                notificationTypeLabel = priorNotification.notificationTypeLabel,
                onBoardCatches,
                portLocode = priorNotification.portLocode,
                portName = priorNotification.portName,
                purposeCode = priorNotification.purposeCode,
                reportingsCount = priorNotification.reportingsCount,
                seaFront = priorNotification.seaFront,
                sentAt = priorNotification.sentAt,
                tripGears,
                tripSegments,
                types,
                vessel = VesselDataOutput.fromVessel(priorNotification.vessel),
                vesselLastControlDate = priorNotification.vesselLastControlDate,
                vesselRiskFactorImpact = priorNotification.vesselRiskFactorImpact,
                vesselRiskFactorProbability = priorNotification.vesselRiskFactorProbability,
                vesselRiskFactorDetectability = priorNotification.vesselRiskFactorDetectability,
                vesselRiskFactor = priorNotification.vesselRiskFactor,
            )
        }
    }
}
