package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookOperationType
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import org.slf4j.Logger
import org.slf4j.LoggerFactory

data class PriorNotificationDataOutput(
    /** Reference logbook message (report) `reportId`. */
    val id: String,
    val acknowledgment: AcknowledgmentDataOutput?,
    val expectedArrivalDate: String?,
    val expectedLandingDate: String?,
    val hasVesselRiskFactorSegments: Boolean?,
    /** Unique identifier concatenating all the DAT, COR, RET & DEL operations `id` used for data consolidation. */
    val fingerprint: String,
    val isCorrection: Boolean,
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
        val logger: Logger = LoggerFactory.getLogger(PriorNotificationDataOutput::class.java)

        fun fromPriorNotification(priorNotification: PriorNotification): PriorNotificationDataOutput? {
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

            return PriorNotificationDataOutput(
                id = referenceReportId,
                acknowledgment = acknowledgment,
                expectedArrivalDate = message.predictedArrivalDatetimeUtc?.toString(),
                expectedLandingDate = message.predictedLandingDatetimeUtc?.toString(),
                hasVesselRiskFactorSegments = priorNotification.vesselRiskFactor?.segments?.isNotEmpty(),
                fingerprint = priorNotification.fingerprint,
                isCorrection = logbookMessage.operationType === LogbookOperationType.COR,
                isVesselUnderCharter = priorNotification.vessel.underCharter,
                onBoardCatches,
                portLocode = priorNotification.port?.locode,
                portName = priorNotification.port?.name,
                purposeCode = message.purpose,
                reportingCount = priorNotification.reportingCount,
                seafront = priorNotification.seafront,
                sentAt = logbookMessage.reportDateTime?.toString(),
                tripGears,
                tripSegments,
                types,
                vesselId = priorNotification.vessel.id,
                vesselExternalReferenceNumber = priorNotification.vessel.externalReferenceNumber,
                vesselFlagCountryCode = priorNotification.vessel.flagState,
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
