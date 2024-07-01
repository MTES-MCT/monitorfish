package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.facade.hasSeafront
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationStats
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationsSortColumn
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.utils.PaginatedList
import org.springframework.data.domain.Sort

@UseCase
class GetPriorNotifications(
    private val gearRepository: GearRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
    private val portRepository: PortRepository,
    private val reportingRepository: ReportingRepository,
    private val riskFactorRepository: RiskFactorRepository,
    private val speciesRepository: SpeciesRepository,
    private val vesselRepository: VesselRepository,
) {
    fun execute(
        filter: PriorNotificationsFilter,
        seafrontGroup: SeafrontGroup,
        sortColumn: PriorNotificationsSortColumn,
        sortDirection: Sort.Direction,
        pageNumber: Int,
        pageSize: Int,
    ): PaginatedList<PriorNotification, PriorNotificationStats> {
        val allGears = gearRepository.findAll()
        val allPorts = portRepository.findAll()
        val allRiskFactors = riskFactorRepository.findAll()
        val allSpecies = speciesRepository.findAll()
        val allVessels = vesselRepository.findAll()

        val automaticPriorNotifications = logbookReportRepository.findAllPriorNotifications(filter)
        val manualPriorNotifications = manualPriorNotificationRepository.findAll(filter)
        val incompletePriorNotifications = automaticPriorNotifications + manualPriorNotifications

        val filteredIncompletePriorNotifications = incompletePriorNotifications
            .filter { !it.logbookMessageTyped.logbookMessage.isDeleted }
            .filter { seafrontGroup.hasSeafront(it.seafront) }

        val priorNotifications = filteredIncompletePriorNotifications
            .map { priorNotification ->
                priorNotification.enrich(allPorts, allRiskFactors, allVessels, priorNotification.isManuallyCreated)
                priorNotification.logbookMessageTyped.logbookMessage
                    .enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)

                priorNotification
            }

        val sortedPriorNotifications = when (sortDirection) {
            Sort.Direction.ASC -> priorNotifications.sortedWith(
                compareBy(
                    { getSortKey(it, sortColumn) },
                    { it.logbookMessageTyped.logbookMessage.id }, // Tie-breaker
                ),
            )

            Sort.Direction.DESC -> priorNotifications.sortedWith(
                // Only solution found to fix typing issues
                compareByDescending<PriorNotification> { getSortKey(it, sortColumn) }
                    .thenByDescending { it.logbookMessageTyped.logbookMessage.id }, // Tie-breaker
            )
        }

        val extraData = PriorNotificationStats(
            perSeafrontGroupCount = SeafrontGroup.entries.associateWith { seafrontGroupEntry ->
                priorNotifications.count { priorNotification ->
                    seafrontGroupEntry.hasSeafront(priorNotification.seafront)
                }
            },
        )

        val paginatedList = PaginatedList.new(
            sortedPriorNotifications,
            pageNumber,
            pageSize,
            extraData,
        )

        // Enrich the reporting count for each prior notification after pagination to limit the number of queries
        val enrichedPaginatedList = paginatedList.apply {
            data.forEach {
                it.enrichReportingCount(reportingRepository)
            }
        }

        return enrichedPaginatedList
    }

    companion object {
        private fun getSortKey(
            priorNotification: PriorNotification,
            sortColumn: PriorNotificationsSortColumn,
        ): Comparable<*>? {
            return when (sortColumn) {
                PriorNotificationsSortColumn.EXPECTED_ARRIVAL_DATE -> priorNotification.logbookMessageTyped.typedMessage.predictedArrivalDatetimeUtc
                PriorNotificationsSortColumn.EXPECTED_LANDING_DATE -> priorNotification.logbookMessageTyped.typedMessage.predictedLandingDatetimeUtc
                PriorNotificationsSortColumn.PORT_NAME -> priorNotification.port?.name
                PriorNotificationsSortColumn.VESSEL_NAME -> priorNotification.logbookMessageTyped.logbookMessage.vesselName
                PriorNotificationsSortColumn.VESSEL_RISK_FACTOR -> priorNotification.logbookMessageTyped.typedMessage.riskFactor
            }
        }
    }
}
