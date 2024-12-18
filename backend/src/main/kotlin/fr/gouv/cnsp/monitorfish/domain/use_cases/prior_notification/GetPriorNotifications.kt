package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationStats
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationsSortColumn
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.UNKNOWN_VESSEL
import fr.gouv.cnsp.monitorfish.domain.repositories.*
import fr.gouv.cnsp.monitorfish.domain.utils.PaginatedList
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Sort
import kotlin.time.measureTimedValue

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
    private val logger: Logger = LoggerFactory.getLogger(GetPriorNotifications::class.java)

    fun execute(
        filter: PriorNotificationsFilter,
        isInvalidated: Boolean?,
        isPriorNotificationZero: Boolean?,
        seafrontGroup: SeafrontGroup,
        states: List<PriorNotificationState>?,
        sortColumn: PriorNotificationsSortColumn,
        sortDirection: Sort.Direction,
        pageNumber: Int,
        pageSize: Int,
    ): PaginatedList<PriorNotification, PriorNotificationStats> {
        val allGears = gearRepository.findAll()
        val allPorts = portRepository.findAll()
        val allRiskFactors = riskFactorRepository.findAll()
        val allSpecies = speciesRepository.findAll()

        val (automaticPriorNotifications, findAllPriorNotificationsTimeTaken) =
            measureTimedValue {
                logbookReportRepository.findAllAcknowledgedPriorNotifications(filter)
            }
        logger.info(
            "TIME_RECORD - 'logbookReportRepository.findAllPriorNotifications()' took $findAllPriorNotificationsTimeTaken.",
        )

        val (manualPriorNotifications, manualPriorNotificationRepositoryFindAllTimeTaken) =
            measureTimedValue {
                manualPriorNotificationRepository.findAll(filter)
            }
        logger.info(
            "TIME_RECORD - 'manualPriorNotificationRepository.findAll()' took $manualPriorNotificationRepositoryFindAllTimeTaken.",
        )

        val incompletePriorNotifications = automaticPriorNotifications + manualPriorNotifications

        val (priorNotifications, enrichedPriorNotificationsTimeTaken) =
            measureTimedValue {
                val priorNotificationsWithoutVessel =
                    incompletePriorNotifications
                        .map { priorNotification ->
                            priorNotification.enrich(allRiskFactors, allPorts, priorNotification.isManuallyCreated)

                            return@map priorNotification
                        }

                enrichPriorNotificationsWithVessel(priorNotificationsWithoutVessel)
            }
        logger.info("TIME_RECORD - 'priorNotifications' took $enrichedPriorNotificationsTimeTaken.")

        val (filteredPriorNotifications, filteredPriorNotificationsTimeTaken) =
            measureTimedValue {
                priorNotifications.filter { priorNotification ->
                    excludeForeignPortsExceptFrenchVessels(priorNotification) &&
                        filterBySeafrontGroup(seafrontGroup, priorNotification) &&
                        filterByStatuses(states, isInvalidated, isPriorNotificationZero, priorNotification)
                }
            }
        logger.info("TIME_RECORD - 'filteredPriorNotifications' took $filteredPriorNotificationsTimeTaken.")

        val (sortedPriorNotifications, sortedPriorNotificationsTimeTaken) =
            measureTimedValue {
                when (sortDirection) {
                    Sort.Direction.ASC ->
                        filteredPriorNotifications.sortedWith(
                            compareBy(
                                { getSortKey(it, sortColumn) },
                                { it.logbookMessageAndValue.logbookMessage.id }, // Tie-breaker
                            ),
                        )

                    Sort.Direction.DESC ->
                        filteredPriorNotifications.sortedWith(
                            // Only solution found to fix typing issues
                            compareByDescending<PriorNotification> { getSortKey(it, sortColumn) }
                                .thenByDescending { it.logbookMessageAndValue.logbookMessage.id }, // Tie-breaker
                        )
                }
            }
        logger.info("TIME_RECORD - 'sortedPriorNotifications' took $sortedPriorNotificationsTimeTaken.")

        val (extraData, extraDataTimeTaken) =
            measureTimedValue {
                PriorNotificationStats(
                    perSeafrontGroupCount =
                        SeafrontGroup.entries.associateWith { seafrontGroupEntry ->
                            priorNotifications.count { priorNotification ->
                                seafrontGroupEntry.hasSeafront(priorNotification.seafront)
                            }
                        },
                )
            }
        logger.info("TIME_RECORD - 'extraData' took $extraDataTimeTaken.")

        val (paginatedList, paginatedListTimeTaken) =
            measureTimedValue {
                PaginatedList.new(
                    sortedPriorNotifications,
                    pageNumber,
                    pageSize,
                    extraData,
                )
            }
        logger.info("TIME_RECORD - 'paginatedList' took $paginatedListTimeTaken.")

        // Enrich the reporting count for each prior notification after pagination to limit the number of queries
        val (enrichedPaginatedList, enrichedPaginatedListTimeTaken) =
            measureTimedValue {
                paginatedList.apply {
                    val reportings = getReportings()

                    data.forEach {
                        it.enrichReportingCount(it.vessel?.internalReferenceNumber, reportings)
                        it.logbookMessageAndValue.logbookMessage
                            .enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)
                    }
                }
            }
        logger.info("TIME_RECORD - 'enrichedPaginatedList' took $enrichedPaginatedListTimeTaken.")

        return enrichedPaginatedList
    }

    private fun PaginatedList<PriorNotification, PriorNotificationStats>.getReportings(): List<Reporting> {
        val internalReferenceNumbers = data.mapNotNull { it.vessel?.internalReferenceNumber }
        val reportings =
            reportingRepository.findAll(
                ReportingFilter(
                    vesselInternalReferenceNumbers = internalReferenceNumbers,
                    isArchived = false,
                    isDeleted = false,
                    types = listOf(ReportingType.INFRACTION_SUSPICION, ReportingType.ALERT),
                ),
            )

        return reportings
    }

    private fun enrichPriorNotificationsWithVessel(
        priorNotifications: List<PriorNotification>,
    ): List<PriorNotification> {
        val vesselsViaVesselsIds =
            priorNotifications
                .asSequence()
                .filter { it.isManuallyCreated }
                .mapNotNull { it.logbookMessageAndValue.logbookMessage.vesselId }
                .distinct()
                .chunked(5000)
                .map { vesselRepository.findVesselsByIds(it) }
                .flatten()
                .toList()
        val vesselsViaInternalReferenceNumbers =
            priorNotifications
                .asSequence()
                .filter { !it.isManuallyCreated }
                .mapNotNull { it.logbookMessageAndValue.logbookMessage.internalReferenceNumber }
                .distinct()
                .chunked(5000)
                .map { vesselRepository.findVesselsByInternalReferenceNumbers(it) }
                .flatten()
                .toList()
        val vessels = vesselsViaVesselsIds + vesselsViaInternalReferenceNumbers

        return priorNotifications.map {
            val isManuallyCreated = it.isManuallyCreated
            val vesselId = it.logbookMessageAndValue.logbookMessage.vesselId
            val internalReferenceNumber = it.logbookMessageAndValue.logbookMessage.internalReferenceNumber

            val vessel =
                vessels.find { searchedVessel ->
                    return@find if (isManuallyCreated) {
                        searchedVessel.id == vesselId
                    } else {
                        searchedVessel.internalReferenceNumber == internalReferenceNumber
                    }
                } ?: UNKNOWN_VESSEL

            return@map it.copy(vessel = vessel)
        }
    }

    companion object {
        private fun excludeForeignPortsExceptFrenchVessels(priorNotification: PriorNotification): Boolean {
            val port = priorNotification.port // Mutable prop
            if (port == null || priorNotification.vessel == null) {
                return true
            }

            return priorNotification.vessel.isFrench() || port.isFrenchOrUnknown()
        }

        private fun filterBySeafrontGroup(
            seafrontGroup: SeafrontGroup,
            priorNotification: PriorNotification,
        ): Boolean {
            return seafrontGroup.hasSeafront(priorNotification.seafront)
        }

        private fun filterByStatuses(
            states: List<PriorNotificationState>?,
            isInvalidated: Boolean?,
            isPriorNotificationZero: Boolean?,
            priorNotification: PriorNotification,
        ): Boolean {
            return (states.isNullOrEmpty() && isInvalidated == null && isPriorNotificationZero == null) ||
                (!states.isNullOrEmpty() && states.contains(priorNotification.state)) ||
                (isInvalidated != null && priorNotification.logbookMessageAndValue.value.isInvalidated == isInvalidated) ||
                (isPriorNotificationZero != null && priorNotification.isPriorNotificationZero == isPriorNotificationZero)
        }

        private fun getSortKey(
            priorNotification: PriorNotification,
            sortColumn: PriorNotificationsSortColumn,
        ): Comparable<*>? {
            return when (sortColumn) {
                PriorNotificationsSortColumn.EXPECTED_ARRIVAL_DATE -> priorNotification.logbookMessageAndValue.value.predictedArrivalDatetimeUtc
                PriorNotificationsSortColumn.EXPECTED_LANDING_DATE -> priorNotification.logbookMessageAndValue.value.predictedLandingDatetimeUtc
                PriorNotificationsSortColumn.PORT_NAME -> priorNotification.port?.name
                PriorNotificationsSortColumn.VESSEL_NAME -> priorNotification.logbookMessageAndValue.logbookMessage.vesselName
                PriorNotificationsSortColumn.VESSEL_RISK_FACTOR -> priorNotification.logbookMessageAndValue.value.riskFactor
            }
        }
    }
}
