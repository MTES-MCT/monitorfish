package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageAndValue
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.UNKNOWN_VESSEL
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.exceptions.BackendInternalErrorCode
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookRawMessageRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

data class PriorNotification(
    val reportId: String?,
    val authorTrigram: String?,
    val createdAt: ZonedDateTime?,
    val didNotFishAfterZeroNotice: Boolean,
    val isManuallyCreated: Boolean,
    var logbookMessageAndValue: LogbookMessageAndValue<PNO>,
    var port: Port?,
    var reportingCount: Int?,
    var seafront: Seafront?,
    val sentAt: ZonedDateTime?,
    val updatedAt: ZonedDateTime?,
    var vessel: Vessel?,
    var lastControlDateTime: ZonedDateTime?,
) {
    /** Each prior notification and each of its updates have a unique fingerprint. */
    val fingerprint: String = listOf(reportId, updatedAt).joinToString(separator = ".")
    private val logger = LoggerFactory.getLogger(PriorNotification::class.java)

    val state: PriorNotificationState?
        /**
         *  See /adrs/0006-prior-notification-states-specifications.md for more details.
         */
        get() = run {
            val pnoMessage = logbookMessageAndValue.value

            val isInVerificationScope = pnoMessage.isInVerificationScope
            val isVerified = pnoMessage.isVerified
            val isSent = pnoMessage.isSent
            val isBeingSent = pnoMessage.isBeingSent

            return when {
                isInVerificationScope == null || isVerified == null || isSent == null || isBeingSent == null -> null
                !isInVerificationScope && !isVerified && !isSent && !isBeingSent -> PriorNotificationState.OUT_OF_VERIFICATION_SCOPE
                !isInVerificationScope && !isVerified && !isSent && isBeingSent -> PriorNotificationState.AUTO_SEND_IN_PROGRESS
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
        allPorts: List<Port>,
        allRiskFactors: List<VesselRiskFactor>,
        allVessels: List<Vessel>,
        isManuallyCreated: Boolean,
    ) {
        val logbookMessage = logbookMessageAndValue.logbookMessage
        val pnoMessage = logbookMessageAndValue.value

        port = try {
            pnoMessage.port?.let { portLocode ->
                allPorts.find { it.locode == portLocode }
            }
        } catch (e: CodeNotFoundException) {
            null
        }

        seafront = port?.facade?.let { Seafront.from(it) }

        // Default to UNKNOWN vessel when null or not found
        vessel = if (isManuallyCreated) {
            logbookMessage.vesselId?.let { vesselId ->
                allVessels.find { it.id == vesselId }
            } ?: UNKNOWN_VESSEL
        } else {
            logbookMessage
                .internalReferenceNumber?.let { vesselInternalReferenceNumber ->
                    allVessels.find { it.internalReferenceNumber == vesselInternalReferenceNumber }
                } ?: UNKNOWN_VESSEL
        }

        lastControlDateTime = if (isManuallyCreated) {
            logbookMessage.vesselId?.let { vesselId ->
                allRiskFactors.find { it.vesselId == vesselId }?.lastControlDatetime
            }
        } else {
            vessel!!.internalReferenceNumber?.let { vesselInternalReferenceNumber ->
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
        val logbookMessageWithRawMessage = logbookMessage.operationNumber?.let { operationNumber ->
            logbookMessage.copy(
                rawMessage = try {
                    logbookRawMessageRepository.findRawMessage(operationNumber)
                } catch (e: NoERSMessagesFound) {
                    logger.warn(e.message)

                    null
                },
            )
        } ?: logbookMessage
        logbookMessageWithRawMessage.enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)

        logbookMessageAndValue = LogbookMessageAndValue(
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

    companion object {
        /**
         * Next initial state of the prior notification once it will be created or updated.
         *
         * Used within the prior notification form to display the next state of the prior notification in real-time.
         */
        fun getNextState(
            isInverificationScope: Boolean,
            isPartOfControlUnitSubscriptions: Boolean,
        ): PriorNotificationState {
            return when {
                isInverificationScope -> PriorNotificationState.PENDING_VERIFICATION
                isPartOfControlUnitSubscriptions -> PriorNotificationState.AUTO_SEND_REQUESTED
                else -> PriorNotificationState.OUT_OF_VERIFICATION_SCOPE
            }
        }
    }
}
