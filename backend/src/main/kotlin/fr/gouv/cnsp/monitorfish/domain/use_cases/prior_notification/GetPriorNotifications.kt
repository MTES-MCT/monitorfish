package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.*

@UseCase
class GetPriorNotifications(
    private val gearRepository: GearRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val portRepository: PortRepository,
    private val reportingRepository: ReportingRepository,
    private val speciesRepository: SpeciesRepository,
) {
    fun execute(filter: LogbookReportFilter): List<PriorNotification> {
        val allGears = gearRepository.findAll()
        val allPorts = portRepository.findAll()
        val allSpecies = speciesRepository.findAll()

        val priorNotificationsWithoutReportingsCount =
            logbookReportRepository.findAllPriorNotifications(filter).map { priorNotification ->
                priorNotification.consolidatedLogbookMessage.logbookMessage
                    .setGearPortAndSpeciesNames(allGears, allPorts, allSpecies)

                val port = try {
                    priorNotification.consolidatedLogbookMessage.typedMessage?.port?.let { portLocode ->
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

        val priorNotifications = enrichPriorNotificationsWithReportingCount(priorNotificationsWithoutReportingsCount)

        return priorNotifications
    }

    private fun enrichPriorNotificationsWithReportingCount(
        priorNotifications: List<PriorNotification>,
    ): List<PriorNotification> {
        val currentReportings = reportingRepository.findAll(
            ReportingFilter(
                vesselInternalReferenceNumbers = priorNotifications.mapNotNull { it.vessel.internalReferenceNumber },
                isArchived = false,
                isDeleted = false,
                types = listOf(ReportingType.INFRACTION_SUSPICION),
            ),
        )

        val priorNotificationsWithReportingCount = priorNotifications.map { priorNotification ->
            val reportingsCount = currentReportings.count { reporting ->
                reporting.internalReferenceNumber == priorNotification.vessel.internalReferenceNumber
            }

            priorNotification.copy(reportingsCount = reportingsCount)
        }

        return priorNotificationsWithReportingCount
    }
}
