package fr.gouv.cnsp.monitorfish.domain.entities.prior_notification

import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.gear.Gear
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTyped
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.species.Species
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.UNKNOWN_VESSEL
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookRawMessageRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.LoggerFactory

data class PriorNotification(
    val reportId: String?,
    val authorTrigram: String?,
    val createdAt: String?,
    val didNotFishAfterZeroNotice: Boolean,
    val isManuallyCreated: Boolean,
    var logbookMessageTyped: LogbookMessageTyped<PNO>,
    var port: Port?,
    var reportingCount: Int?,
    var seafront: Seafront?,
    val sentAt: String?,
    var state: PriorNotificationState?,
    val updatedAt: String?,
    var vessel: Vessel?,
    var vesselRiskFactor: VesselRiskFactor?,
) {
    /** Each prior notification and each of its updates have a unique fingerprint. */
    val fingerprint: String = listOf(reportId, updatedAt).joinToString(separator = ".")
    private val logger = LoggerFactory.getLogger(PriorNotification::class.java)

    fun enrich(allPorts: List<Port>, allRiskFactors: List<VesselRiskFactor>, allVessels: List<Vessel>) {
        val logbookMessage = logbookMessageTyped.logbookMessage
        val pnoMessage = logbookMessageTyped.typedMessage

        port = try {
            pnoMessage.port?.let { portLocode ->
                allPorts.find { it.locode == portLocode }
            }
        } catch (e: CodeNotFoundException) {
            null
        }

        seafront = port?.facade?.let { Seafront.from(it) }

        val isBeingSent = pnoMessage.isBeingSent
        val isInVerificationScope = pnoMessage.isInVerificationScope
        val isVerified = pnoMessage.isVerified
        val isSent = pnoMessage.isSent
        state = when {
            isBeingSent == null || isInVerificationScope == null || isVerified == null || isSent == null -> null
            isVerified && isSent -> PriorNotificationState.VERIFIED_AND_SENT
            isSent -> PriorNotificationState.SENT
            isBeingSent -> PriorNotificationState.PENDING_SEND
            isInVerificationScope -> PriorNotificationState.PENDING_VERIFICATION
            else -> PriorNotificationState.OUT_OF_VERIFICATION_SCOPE
        }

        // Default to UNKNOWN vessel when null or not found
        vessel = logbookMessage
            .internalReferenceNumber?.let { vesselInternalReferenceNumber ->
                allVessels.find { it.internalReferenceNumber == vesselInternalReferenceNumber }
            } ?: UNKNOWN_VESSEL

        vesselRiskFactor = vessel!!.internalReferenceNumber?.let { vesselInternalReferenceNumber ->
            allRiskFactors.find { it.internalReferenceNumber == vesselInternalReferenceNumber }
        }
    }

    fun enrichLogbookMessage(
        allGears: List<Gear>,
        allPorts: List<Port>,
        allSpecies: List<Species>,
        logbookRawMessageRepository: LogbookRawMessageRepository,
    ) {
        val logbookMessage = logbookMessageTyped.logbookMessage
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

        logbookMessageTyped = LogbookMessageTyped(
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
}
