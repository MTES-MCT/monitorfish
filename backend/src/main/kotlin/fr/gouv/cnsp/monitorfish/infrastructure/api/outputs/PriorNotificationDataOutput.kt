package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification

class PriorNotificationDataOutput(
    /** Logbook report `reportId`. */
    val id: String,
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
        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDataOutput? {
            val logbookMessage = priorNotification.consolidatedLogbookMessage.logbookMessage
            if (logbookMessage.reportId == null) {
                return null
            }
            val message = priorNotification.consolidatedLogbookMessage.typedMessage

            val onBoardCatches = message.catchOnboard.map { LogbookMessageCatchDataOutput.fromCatch(it) }
            val tripGears = logbookMessage.tripGears?.mapNotNull {
                LogbookMessageGearDataOutput.fromGear(it)
            } ?: emptyList()
            val tripSegments = logbookMessage.tripSegments?.map {
                LogbookMessageTripSegmentDataOutput.fromLogbookTripSegment(it)
            } ?: emptyList()
            val types = message.pnoTypes.map { PriorNotificationTypeDataOutput.fromPriorNotificationType(it) }

            return PriorNotificationDataOutput(
                id = logbookMessage.reportId,
                expectedArrivalDate = message.predictedArrivalDatetimeUtc?.toString(),
                expectedLandingDate = message.predictedLandingDatetimeUtc?.toString(),
                hasVesselRiskFactorSegments = priorNotification.vesselRiskFactor?.segments?.isNotEmpty(),
                isVesselUnderCharter = priorNotification.vessel.underCharter,
                onBoardCatches,
                portLocode = priorNotification.port?.locode,
                portName = priorNotification.port?.name,
                purposeCode = message.purpose,
                reportingsCount = priorNotification.reportingsCount,
                seaFront = priorNotification.seaFront,
                sentAt = logbookMessage.reportDateTime?.toString(),
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
