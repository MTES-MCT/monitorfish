package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import com.neovisionaries.i18n.CountryCode
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.filters.LogbookReportFilter
import fr.gouv.cnsp.monitorfish.domain.entities.logbook.sorters.LogbookReportSortColumn
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.exceptions.CodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import org.springframework.data.domain.Sort

@UseCase
class GetPriorNotifications(
    private val gearRepository: GearRepository,
    private val logbookReportRepository: LogbookReportRepository,
    private val portRepository: PortRepository,
    private val reportingRepository: ReportingRepository,
    private val riskFactorRepository: RiskFactorRepository,
    private val speciesRepository: SpeciesRepository,
    private val vesselRepository: VesselRepository,
) {
    fun execute(
        filter: LogbookReportFilter,
        sortColumn: LogbookReportSortColumn,
        sortDirection: Sort.Direction,
        pageSize: Int,
        pageNumber: Int,
    ): List<PriorNotification> {
        val allGears = gearRepository.findAll()
        val allPorts = portRepository.findAll()
        val allRiskFactors = riskFactorRepository.findAll()
        val allSpecies = speciesRepository.findAll()
        val allVessels = vesselRepository.findAll()

        val incompletePriorNotifications = logbookReportRepository.findAllPriorNotifications(filter)
        val priorNotificationsWithoutReportingsCount = incompletePriorNotifications
            .map { priorNotification ->
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

                val seafront: Seafront? = port?.facade?.let { Seafront.valueOf(it) }

                val finalPriorNotification = priorNotification.copy(
                    port = port,
                    seafront = seafront,
                    vessel = vessel,
                    vesselRiskFactor = vesselRiskFactor,
                )

                finalPriorNotification.logbookMessageTyped.logbookMessage
                    .enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)

                finalPriorNotification
            }
        val priorNotifications = enrichPriorNotificationsWithReportingCount(priorNotificationsWithoutReportingsCount)

        val sortedPriorNotifications = when (sortDirection) {
            Sort.Direction.ASC -> priorNotifications.sortedWith(
                compareBy(
                    { getSortKey(it, sortColumn) },
                    { it.logbookMessageTyped.logbookMessage.id },
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

    companion object {
        private fun getSortKey(
            priorNotification: PriorNotification,
            sortColumn: LogbookReportSortColumn,
        ): Comparable<*>? {
            return when (sortColumn) {
                LogbookReportSortColumn.EXPECTED_ARRIVAL_DATE -> priorNotification.logbookMessageTyped.typedMessage.predictedArrivalDatetimeUtc
                LogbookReportSortColumn.EXPECTED_LANDING_DATE -> priorNotification.logbookMessageTyped.typedMessage.predictedLandingDatetimeUtc
                LogbookReportSortColumn.PORT_NAME -> priorNotification.port?.name
                LogbookReportSortColumn.VESSEL_NAME -> priorNotification.logbookMessageTyped.logbookMessage.vesselName
                LogbookReportSortColumn.VESSEL_RISK_FACTOR -> priorNotification.vesselRiskFactor?.riskFactor
            }
        }
    }
}
