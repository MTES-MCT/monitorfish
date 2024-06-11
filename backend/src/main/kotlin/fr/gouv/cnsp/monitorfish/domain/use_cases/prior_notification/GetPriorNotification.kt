package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTyped
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.UNKNOWN_VESSEL
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.exceptions.NoERSMessagesFound
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.slf4j.LoggerFactory

@UseCase
class GetPriorNotification(
    private val gearRepository: GearRepository,
    private val logbookRawMessageRepository: LogbookRawMessageRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val portRepository: PortRepository,
    private val reportingRepository: ReportingRepository,
    private val riskFactorRepository: RiskFactorRepository,
    private val speciesRepository: SpeciesRepository,
    private val vesselRepository: VesselRepository,
) {
    private val logger = LoggerFactory.getLogger(GetPriorNotification::class.java)

    fun execute(logbookMessageReportId: String): PriorNotification {
        val allGears = gearRepository.findAll()
        val allPorts = portRepository.findAll()
        val allRiskFactors = riskFactorRepository.findAll()
        val allSpecies = speciesRepository.findAll()
        val allVessels = vesselRepository.findAll()

        val priorNotificationWithoutReportingCount = logbookReportRepository
            .findPriorNotificationByReportId(logbookMessageReportId)
            .let { priorNotification ->
                val logbookMessage = priorNotification.logbookMessageTyped.logbookMessage
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

                val port = try {
                    priorNotification.logbookMessageTyped.typedMessage.port?.let { portLocode ->
                        allPorts.find { it.locode == portLocode }
                    }
                } catch (e: CodeNotFoundException) {
                    null
                }

                val seafront: Seafront? = port?.facade?.let { Seafront.from(it) }

                // Default to UNKNOWN vessel when null or not found
                val vessel = priorNotification.logbookMessageTyped.logbookMessage
                    .internalReferenceNumber?.let { vesselInternalReferenceNumber ->
                        allVessels.find { it.internalReferenceNumber == vesselInternalReferenceNumber }
                    } ?: UNKNOWN_VESSEL

                val vesselRiskFactor = vessel.internalReferenceNumber?.let { vesselInternalReferenceNumber ->
                    allRiskFactors.find { it.internalReferenceNumber == vesselInternalReferenceNumber }
                }

                val finalPriorNotification = priorNotification.copy(
                    logbookMessageTyped = LogbookMessageTyped(
                        logbookMessageWithRawMessage,
                        PNO::class.java,
                    ),
                    port = port,
                    seafront = seafront,
                    vessel = vessel,
                    vesselRiskFactor = vesselRiskFactor,
                )

                finalPriorNotification.logbookMessageTyped.logbookMessage
                    .enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)

                finalPriorNotification
            }

        val priorNotification = enrichPriorNotificationWithReportingCount(priorNotificationWithoutReportingCount)

        return priorNotification
    }

    private fun enrichPriorNotificationWithReportingCount(priorNotification: PriorNotification): PriorNotification {
        val currentReportings = priorNotification.vessel.internalReferenceNumber?.let { vesselInternalReferenceNumber ->
            reportingRepository.findAll(
                ReportingFilter(
                    vesselInternalReferenceNumbers = listOf(vesselInternalReferenceNumber),
                    isArchived = false,
                    isDeleted = false,
                    types = listOf(ReportingType.INFRACTION_SUSPICION),
                ),
            )
        }

        val reportingCount = currentReportings?.count() ?: 0

        return priorNotification.copy(reportingCount = reportingCount)
    }
}
