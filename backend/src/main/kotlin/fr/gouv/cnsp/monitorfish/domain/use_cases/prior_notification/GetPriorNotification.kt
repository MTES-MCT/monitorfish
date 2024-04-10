package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.use_cases.vessel.GetLogbookMessages
import org.slf4j.LoggerFactory

@UseCase
class GetPriorNotification(
    private val gearRepository: GearRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val portRepository: PortRepository,
    private val reportingRepository: ReportingRepository,
    private val speciesRepository: SpeciesRepository,
) {
    private val logger = LoggerFactory.getLogger(GetLogbookMessages::class.java)

    fun execute(logbookMessageReportId: String): PriorNotification {
        val allGears = gearRepository.findAll()
        val allPorts = portRepository.findAll()
        val allSpecies = speciesRepository.findAll()

        val priorNotificationWithoutReportingsCount = logbookReportRepository
            .findPriorNotificationByReportId(logbookMessageReportId)
            .let { priorNotification ->
                logger.info("Prior notification found: ${priorNotification.consolidatedLogbookMessage.logbookMessage}")

                priorNotification.consolidatedLogbookMessage.logbookMessage
                    .enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)

                val port = try {
                    priorNotification.consolidatedLogbookMessage.typedMessage.port?.let { portLocode ->
                        allPorts.find { it.locode == portLocode }
                    }
                } catch (e: CodeNotFoundException) {
                    null
                }

                priorNotification.copy(
                    port = port,
                    seaFront = port?.facade,
                )
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
