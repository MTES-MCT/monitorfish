package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessage
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.Acknowledgment
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.UNKNOWN_VESSEL
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookRawMessageRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

data class PriorNotification(
    val reportId: String?,
    val createdAt: ZonedDateTime?,
    val didNotFishAfterZeroNotice: Boolean,
    val isManuallyCreated: Boolean,
    var logbookMessageAndValue: LogbookMessageAndValue<PNO>,
    var port: Port?,
    var reportingCount: Int?,
    var seafront: Seafront?,
    val sentAt: ZonedDateTime?,
    val updatedAt: ZonedDateTime?,
    val vessel: Vessel?,
    var lastControlDateTime: ZonedDateTime?,
) {
    /** Each prior notification and each of its updates have a unique fingerprint. */
    val fingerprint: String = listOf(reportId, updatedAt, state).joinToString(separator = ".")

    /** Is it a "Préavis Zéro"? */
    val isPriorNotificationZero: Boolean
        get() =
            logbookMessageAndValue.value.catchToLand.isNotEmpty() &&
                logbookMessageAndValue.value.catchToLand
                    .all { catchToLand -> catchToLand.weight == null || catchToLand.weight == 0.0 }

    val state: PriorNotificationState?
        /**
         *  See /adrs/0006-prior-notification-states-specifications.md for more details.
         */
        get() =
            run {
                val pnoValue = logbookMessageAndValue.value

                val isInVerificationScope = pnoValue.isInVerificationScope
                val isVerified = pnoValue.isVerified
                val isSent = pnoValue.isSent
                val isBeingSent = pnoValue.isBeingSent

                return when {
                    isInVerificationScope == null || isVerified == null || isSent == null || isBeingSent == null -> null
                    !isInVerificationScope && !isVerified && !isSent && !isBeingSent -> PriorNotificationState.OUT_OF_VERIFICATION_SCOPE
                    !isInVerificationScope && !isVerified && !isSent && isBeingSent -> PriorNotificationState.PENDING_AUTO_SEND
                    !isInVerificationScope && !isVerified && isSent && !isBeingSent -> PriorNotificationState.AUTO_SEND_DONE
                    !isInVerificationScope && isVerified && !isSent && !isBeingSent -> PriorNotificationState.FAILED_SEND
                    !isInVerificationScope && isVerified && !isSent && isBeingSent -> PriorNotificationState.PENDING_SEND
                    !isInVerificationScope && isVerified && isSent && !isBeingSent -> PriorNotificationState.VERIFIED_AND_SENT
                    isInVerificationScope && !isVerified && !isSent && !isBeingSent -> PriorNotificationState.PENDING_VERIFICATION
                    isInVerificationScope && isVerified && !isSent && !isBeingSent -> PriorNotificationState.FAILED_SEND
                    isInVerificationScope && isVerified && !isSent && isBeingSent -> PriorNotificationState.PENDING_SEND
                    isInVerificationScope && isVerified && isSent && !isBeingSent -> PriorNotificationState.VERIFIED_AND_SENT
                    else -> {
                        logger.error(
                            "Impossible PriorNotification state: `reportId = $reportId`, isInVerificationScope = $isInVerificationScope`, `isVerified = $isVerified`, `isSent = $isSent`, `isBeingSent = $isBeingSent`.",
                            BackendInternalErrorCode.UNPROCESSABLE_RESOURCE_DATA,
                        )

                        null
                    }
                }
            }

    fun enrich(
        allRiskFactors: List<VesselRiskFactor>,
        allPorts: List<Port>,
        isManuallyCreated: Boolean,
    ) {
        val logbookMessage = logbookMessageAndValue.logbookMessage
        val pnoValue = logbookMessageAndValue.value

        port =
            pnoValue.port?.let { portLocode: String ->
                allPorts.find { it.locode == portLocode }
            }

        seafront = port?.facade?.let { Seafront.from(it) }

        lastControlDateTime =
            if (isManuallyCreated) {
                logbookMessage.vesselId?.let { vesselId ->
                    allRiskFactors.find { it.vesselId == vesselId }?.lastControlDatetime
                }
            } else {
                logbookMessage.internalReferenceNumber?.let { vesselInternalReferenceNumber ->
                    allRiskFactors.find { it.internalReferenceNumber == vesselInternalReferenceNumber }?.lastControlDatetime
                }
            }
    }

    fun enrichLogbookMessage(
        allGears: List<Gear>,
        allPorts: List<Port>,
        allSpecies: List<Species>,
        logbookRawMessageRepository: LogbookRawMessageRepository,
    ) {
        val logbookMessage = logbookMessageAndValue.logbookMessage
        val logbookMessageWithRawMessage =
            logbookMessage.operationNumber?.let { operationNumber ->
                logbookMessage.copy(
                    rawMessage =
                        try {
                            logbookRawMessageRepository.findRawMessage(operationNumber)
                        } catch (e: NoERSMessagesFound) {
                            logger.warn(e.message)

                            null
                        },
                )
            } ?: logbookMessage
        logbookMessageWithRawMessage.enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)

        logbookMessageAndValue =
            LogbookMessageAndValue(
                logbookMessageWithRawMessage,
                PNO::class.java,
            )
    }

    fun enrichReportingCount(reportingRepository: ReportingRepository) {
        val currentReportings =
            vessel?.internalReferenceNumber?.let { vesselInternalReferenceNumber ->
                reportingRepository.findAll(
                    ReportingFilter(
                        vesselInternalReferenceNumbers = listOf(vesselInternalReferenceNumber),
                        isArchived = false,
                        isDeleted = false,
                        types = listOf(ReportingType.INFRACTION_SUSPICION),
                    ),
                )
            }

        reportingCount = currentReportings?.count() ?: 0
    }

    fun enrichReportingCount(
        internalReferenceNumber: String?,
        reportings: List<Reporting>,
    ) {
        val currentReportings =
            internalReferenceNumber?.let { vesselInternalReferenceNumber ->
                reportings.filter { it.internalReferenceNumber == vesselInternalReferenceNumber }
            }

        reportingCount = currentReportings?.count() ?: 0
    }

    fun markAsAcknowledged() {
        logbookMessageAndValue =
            LogbookMessageAndValue(
                logbookMessageAndValue.logbookMessage.copy(acknowledgment = Acknowledgment(isSuccess = true)),
                PNO::class.java,
            )
    }

    companion object {
        private val logger = LoggerFactory.getLogger(PriorNotification::class.java)

        fun fromLogbookMessage(logbookMessage: LogbookMessage): PriorNotification {
            val logbookMessageAndValue =
                LogbookMessageAndValue(
                    logbookMessage = logbookMessage,
                    clazz = PNO::class.java,
                )

            return PriorNotification(
                reportId = logbookMessage.reportId,
                createdAt = logbookMessage.operationDateTime,
                didNotFishAfterZeroNotice = false,
                isManuallyCreated = false,
                logbookMessageAndValue = logbookMessageAndValue,
                sentAt = logbookMessageAndValue.logbookMessage.reportDateTime,
                updatedAt = logbookMessageAndValue.value.updatedAt ?: logbookMessage.operationDateTime,
                // These props need to be calculated in the use case
                port = null,
                reportingCount = null,
                seafront = null,
                // For practical reasons `vessel` can't be `null`, so we temporarily set it to "Navire inconnu"
                vessel = UNKNOWN_VESSEL,
                lastControlDateTime = null,
            )
        }

        /**
         * Next initial state of the prior notification once it will be created or updated.
         *
         * Used within the prior notification form to display the next state of the prior notification in real-time.
         */
        fun getNextState(
            isInVerificationScope: Boolean,
            isPartOfControlUnitSubscriptions: Boolean,
        ): PriorNotificationState {
            return when {
                isInVerificationScope -> PriorNotificationState.PENDING_VERIFICATION
                isPartOfControlUnitSubscriptions -> PriorNotificationState.AUTO_SEND_REQUESTED
                else -> PriorNotificationState.OUT_OF_VERIFICATION_SCOPE
            }
        }
    }
}
