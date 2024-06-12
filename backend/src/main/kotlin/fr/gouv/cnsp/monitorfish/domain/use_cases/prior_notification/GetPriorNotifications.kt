package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationsSortColumn
import fr.gouv.cnsp.monitorfish.domain.repositories.*
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
        sortColumn: PriorNotificationsSortColumn,
        sortDirection: Sort.Direction,
    ): List<PriorNotification> {
        val allGears = gearRepository.findAll()
        val allPorts = portRepository.findAll()
        val allRiskFactors = riskFactorRepository.findAll()
        val allSpecies = speciesRepository.findAll()
        val allVessels = vesselRepository.findAll()

        val automaticPriorNotifications = logbookReportRepository.findAllPriorNotifications(filter)
        val manualPriorNotifications = manualPriorNotificationRepository.findAll(filter)
        val incompletePriorNotifications = automaticPriorNotifications + manualPriorNotifications

        val priorNotifications = incompletePriorNotifications
            .map { priorNotification ->
                priorNotification.enrich(allPorts, allRiskFactors, allVessels)
                priorNotification.enrichReportingCount(reportingRepository)
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
        val sortedPriorNotificationsWithoutDeletedOnes = sortedPriorNotifications
            .filter { !it.logbookMessageTyped.logbookMessage.isDeleted }

        return sortedPriorNotificationsWithoutDeletedOnes
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
                PriorNotificationsSortColumn.VESSEL_RISK_FACTOR -> priorNotification.vesselRiskFactor?.riskFactor
            }
        }
    }
}
