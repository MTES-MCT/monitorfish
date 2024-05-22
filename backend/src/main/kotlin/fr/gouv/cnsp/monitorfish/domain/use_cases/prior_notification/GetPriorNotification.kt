package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.LogbookMessageTyped
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.messages.PNO
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
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

        val priorNotificationWithoutReportingsCount = logbookReportRepository
            .findPriorNotificationByReportId(logbookMessageReportId)
            .let { priorNotification ->
                val logbookMessage = priorNotification.logbookMessageTyped.logbookMessage
                val logbookMessageWithRawMessage = logbookMessage.copy(
                    rawMessage = try {
                        logbookRawMessageRepository.findRawMessage(logbookMessage.operationNumber)
                    } catch (e: NoERSMessagesFound) {
                        logger.warn(e.message)

                        null
                    },
                )

                val port = try {
                    priorNotification.logbookMessageTyped.typedMessage.port?.let { portLocode ->
                        allPorts.find { it.locode == portLocode }
                    }
                } catch (e: CodeNotFoundException) {
                    null
                }

                // Default to UNKNOWN vessel when null or not found
                val vessel = priorNotification.logbookMessageTyped.logbookMessage
                    .internalReferenceNumber?.let { vesselInternalReferenceNumber ->
                        allVessels.find { it.internalReferenceNumber == vesselInternalReferenceNumber }
                    } ?: Vessel(id = -1, flagState = CountryCode.UNDEFINED)

                val vesselRiskFactor = vessel.internalReferenceNumber?.let { vesselInternalReferenceNumber ->
                    allRiskFactors.find { it.internalReferenceNumber == vesselInternalReferenceNumber }
                }

                val finalPriorNotification = priorNotification.copy(
                    logbookMessageTyped = LogbookMessageTyped(logbookMessageWithRawMessage, PNO::class.java),
                    port = port,
                    seafront = port?.facade,
                    vessel = vessel,
                    vesselRiskFactor = vesselRiskFactor,
                )

                finalPriorNotification.logbookMessageTyped.logbookMessage
                    .enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)

                finalPriorNotification
            }

        val priorNotification = enrichPriorNotificationWithReportingCount(priorNotificationWithoutReportingsCount)

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

        val reportingsCount = currentReportings?.count() ?: 0

        return priorNotification.copy(reportingsCount = reportingsCount)
    }
}
