package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationStats
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationsSortColumn
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
                incompletePriorNotifications
                    .map { priorNotification ->
                        priorNotification.enrich(allRiskFactors, allPorts, priorNotification.isManuallyCreated)
                        priorNotification.logbookMessageAndValue.logbookMessage
                            .enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)

                        priorNotification
                    }
            }
        logger.info("TIME_RECORD - 'priorNotifications' took $enrichedPriorNotificationsTimeTaken.")

        val (sortedAndFilteredPriorNotifications, sortedAndFilteredPriorNotificationsTimeTaken) =
            measureTimedValue {
                when (sortDirection) {
                    Sort.Direction.ASC ->
                        priorNotifications.sortedWith(
                            compareBy(
                                { getSortKey(it, sortColumn) },
                                { it.logbookMessageAndValue.logbookMessage.id }, // Tie-breaker
                            ),
                        )

                    Sort.Direction.DESC ->
                        priorNotifications.sortedWith(
                            // Only solution found to fix typing issues
                            compareByDescending<PriorNotification> { getSortKey(it, sortColumn) }
                                .thenByDescending { it.logbookMessageAndValue.logbookMessage.id }, // Tie-breaker
                        )
                }.filter { priorNotification ->
                    seafrontGroup.hasSeafront(priorNotification.seafront) && (
                        (states.isNullOrEmpty() && isInvalidated == null) ||
                            (!states.isNullOrEmpty() && states.contains(priorNotification.state)) ||
                            (isInvalidated != null && priorNotification.logbookMessageAndValue.value.isInvalidated == isInvalidated)
                    )
                }
            }
        logger.info(
            "TIME_RECORD - 'sortedAndFilteredPriorNotifications' took $sortedAndFilteredPriorNotificationsTimeTaken.",
        )

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
                    sortedAndFilteredPriorNotifications,
                    pageNumber,
                    pageSize,
                    extraData,
                )
            }
        logger.info("TIME_RECORD - 'paginatedList' took $paginatedListTimeTaken.")

        val paginatedListWithVessels = paginatedList.copy(data = getPriorNotificationsWithVessel(paginatedList.data))

        // Enrich the reporting count for each prior notification after pagination to limit the number of queries
        val (enrichedPaginatedList, enrichedPaginatedListTimeTaken) =
            measureTimedValue {
                paginatedListWithVessels.apply {
                    data.forEach {
                        it.enrichReportingCount(reportingRepository)
                    }
                }
            }
        logger.info("TIME_RECORD - 'enrichedPaginatedList' took $enrichedPaginatedListTimeTaken.")

        return enrichedPaginatedList
    }

    private fun getPriorNotificationsWithVessel(priorNotifications: List<PriorNotification>): List<PriorNotification> {
        val vesselsIds =
            priorNotifications
                .filter { it.isManuallyCreated }
                .mapNotNull { it.logbookMessageAndValue.logbookMessage.vesselId }
        val internalReferenceNumbers =
            priorNotifications
                .filter { !it.isManuallyCreated }
                .mapNotNull { it.logbookMessageAndValue.logbookMessage.internalReferenceNumber }
        val vessels =
            vesselRepository.findVesselsByIds(vesselsIds) +
                vesselRepository.findVesselsByInternalReferenceNumbers(internalReferenceNumbers)

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
