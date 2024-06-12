package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import org.slf4j.Logger
import org.slf4j.LoggerFactory

data class PriorNotificationListItemDataOutput(
    /** Reference logbook message (report) `reportId`. */
    val id: String,
    val acknowledgment: AcknowledgmentDataOutput?,
    val createdAt: String?,
    val expectedArrivalDate: String?,
    val expectedLandingDate: String?,
    val hasVesselRiskFactorSegments: Boolean?,
    /** Unique identifier concatenating all the DAT, COR, RET & DEL operations `id` used for data consolidation. */
    val fingerprint: String,
    val isCorrection: Boolean,
    val isManuallyCreated: Boolean = false,
    val isVesselUnderCharter: Boolean?,
    val onBoardCatches: List<LogbookMessageCatchDataOutput>,
    val portLocode: String?,
    val portName: String?,
    val purposeCode: String?,
    val reportingCount: Int?,
    val seafront: Seafront?,
    val sentAt: String?,
    val tripGears: List<LogbookMessageGearDataOutput>,
    val tripSegments: List<LogbookMessageTripSegmentDataOutput>,
    val types: List<PriorNotificationTypeDataOutput>,
    val updatedAt: String?,
    val vesselId: Int?,
    val vesselExternalReferenceNumber: String?,
    val vesselFlagCountryCode: CountryCode,
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
        val logger: Logger = LoggerFactory.getLogger(PriorNotificationListItemDataOutput::class.java)

        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationListItemDataOutput? {
            val logbookMessage = priorNotification.logbookMessageTyped.logbookMessage
            val referenceReportId = logbookMessage.getReferenceReportId()
            if (referenceReportId == null) {
                logger.warn("Prior notification has neither `reportId` nor `referencedReportId`: $priorNotification.")

                return null
            }
            val message = priorNotification.logbookMessageTyped.typedMessage

            val acknowledgment = logbookMessage.acknowledgment?.let { AcknowledgmentDataOutput.fromAcknowledgment(it) }
            val onBoardCatches = message.catchOnboard.map { LogbookMessageCatchDataOutput.fromCatch(it) }
            val tripGears = logbookMessage.tripGears?.mapNotNull {
                LogbookMessageGearDataOutput.fromGear(it)
            } ?: emptyList()
            val tripSegments = logbookMessage.tripSegments?.map {
                LogbookMessageTripSegmentDataOutput.fromLogbookTripSegment(it)
            } ?: emptyList()
            val types = message.pnoTypes.map { PriorNotificationTypeDataOutput.fromPriorNotificationType(it) }
            val vessel = requireNotNull(priorNotification.vessel)

            return PriorNotificationListItemDataOutput(
                id = referenceReportId,
                acknowledgment = acknowledgment,
                createdAt = priorNotification.createdAt.toString(),
                expectedArrivalDate = message.predictedArrivalDatetimeUtc?.toString(),
                expectedLandingDate = message.predictedLandingDatetimeUtc?.toString(),
                hasVesselRiskFactorSegments = priorNotification.vesselRiskFactor?.segments?.isNotEmpty(),
                fingerprint = priorNotification.fingerprint,
                isCorrection = logbookMessage.operationType === LogbookOperationType.COR,
                isManuallyCreated = priorNotification.isManuallyCreated,
                isVesselUnderCharter = vessel.underCharter,
                onBoardCatches,
                portLocode = priorNotification.port?.locode,
                portName = priorNotification.port?.name,
                purposeCode = message.purpose.toString(),
                reportingCount = priorNotification.reportingCount,
                seafront = priorNotification.seafront,
                sentAt = logbookMessage.reportDateTime?.toString(),
                tripGears,
                tripSegments,
                types,
                updatedAt = priorNotification.updatedAt.toString(),
                vesselId = vessel.id,
                vesselExternalReferenceNumber = vessel.externalReferenceNumber,
                vesselFlagCountryCode = vessel.flagState,
                vesselInternalReferenceNumber = vessel.internalReferenceNumber,
                vesselIrcs = vessel.ircs,
                vesselLastControlDate = priorNotification.vesselRiskFactor?.lastControlDatetime?.toString(),
                vesselLength = vessel.length,
                vesselMmsi = vessel.mmsi,
                vesselName = vessel.vesselName,
                vesselRiskFactor = priorNotification.vesselRiskFactor?.riskFactor,
                vesselRiskFactorImpact = priorNotification.vesselRiskFactor?.impactRiskFactor,
                vesselRiskFactorProbability = priorNotification.vesselRiskFactor?.probabilityRiskFactor,
                vesselRiskFactorDetectability = priorNotification.vesselRiskFactor?.detectabilityRiskFactor,
            )
        }
    }
}
