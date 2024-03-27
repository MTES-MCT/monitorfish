package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification

class PriorNotificationDataOutput(
    val id: Long,
    val expectedArrivalDate: String?,
    val expectedLandingDate: String?,
    val hasVesselRiskFactorSegments: Boolean?,
    val isVesselUnderCharter: Boolean?,
    val onBoardCatches: List<LogbookMessageCatchDataOutput>,
    val portLocode: String?,
    val portName: String?,
    val purposeCode: String?,
    val reportingsCount: Int?,
    val seaFront: String?,
    val sentAt: String?,
    val tripGears: List<LogbookMessageGearDataOutput>,
    val tripSegments: List<LogbookMessageTripSegmentDataOutput>,
    val types: List<PriorNotificationTypeDataOutput>,
    val vesselId: Int?,
    val vesselExternalReferenceNumber: String?,
    val vesselFlagCountryCode: String?,
    val vesselInternalReferenceNumber: String?,
    val vesselIrcs: String?,
    val vesselLastControlDate: String?,
    val vesselLength: Double?,
    val vesselMmsi: String?,
    val vesselName: String?,
    val vesselRiskFactor: Double?,
    val vesselRiskFactorImpact: Double?,
    val vesselRiskFactorProbability: Double?,
    val vesselRiskFactorDetectability: Double?,
) {
    companion object {
        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDataOutput {
            val message = priorNotification.logbookMessage.message as PNO

            val onBoardCatches = message.catchOnboard.map { LogbookMessageCatchDataOutput.fromCatch(it) }
            val tripGears = priorNotification.logbookMessage.tripGears?.mapNotNull {
                LogbookMessageGearDataOutput.fromGear(it)
            } ?: emptyList()
            val tripSegments = priorNotification.logbookMessage.tripSegments?.map {
                LogbookMessageTripSegmentDataOutput.fromLogbookTripSegment(it)
            } ?: emptyList()
            val types = message.pnoTypes.map { PriorNotificationTypeDataOutput.fromPriorNotificationType(it) }

            return PriorNotificationDataOutput(
                id = priorNotification.id,
                expectedArrivalDate = message.predictedArrivalDateTime?.toString(),
                expectedLandingDate = message.predictedLandingDatetime?.toString(),
                hasVesselRiskFactorSegments = priorNotification.vesselRiskFactor?.segments?.isNotEmpty(),
                isVesselUnderCharter = priorNotification.vessel.underCharter,
                onBoardCatches,
                portLocode = priorNotification.port?.locode,
                portName = priorNotification.port?.name,
                purposeCode = message.purpose,
                reportingsCount = priorNotification.reportingsCount,
                seaFront = priorNotification.seaFront,
                sentAt = priorNotification.logbookMessage.reportDateTime?.toString(),
                tripGears,
                tripSegments,
                types,
                vesselId = priorNotification.vessel.id,
                vesselExternalReferenceNumber = priorNotification.vessel.externalReferenceNumber,
                vesselFlagCountryCode = priorNotification.vessel.flagState.toString(),
                vesselInternalReferenceNumber = priorNotification.vessel.internalReferenceNumber,
                vesselIrcs = priorNotification.vessel.ircs,
                vesselLastControlDate = priorNotification.vesselRiskFactor?.lastControlDatetime?.toString(),
                vesselLength = priorNotification.vessel.length,
                vesselMmsi = priorNotification.vessel.mmsi,
                vesselName = priorNotification.vessel.vesselName,
                vesselRiskFactor = priorNotification.vesselRiskFactor?.riskFactor,
                vesselRiskFactorImpact = priorNotification.vesselRiskFactor?.impactRiskFactor,
                vesselRiskFactorProbability = priorNotification.vesselRiskFactor?.probabilityRiskFactor,
                vesselRiskFactorDetectability = priorNotification.vesselRiskFactor?.detectabilityRiskFactor,
            )
        }
    }
}
