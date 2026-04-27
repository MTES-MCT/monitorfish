package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.port.Port
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotification
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationState
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.PriorNotificationStats
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.sorters.PriorNotificationsSortColumn
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
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
        val allPorts = portRepository.findAll()
        val allRiskFactors = riskFactorRepository.findAll()

        val allPriorNotifications =
            timed("fetch and enrich") {
                fetchAndEnrich(filter, allPorts, allRiskFactors)
            }
        val filteredPriorNotifications =
            timed("filter") {
                filter(allPriorNotifications, seafrontGroup, states, isInvalidated, isPriorNotificationZero)
            }
        val sortedPriorNotifications =
            timed("sort") {
                sort(filteredPriorNotifications, sortColumn, sortDirection)
            }
        val stats =
            timed("stats") {
                computeStats(allPriorNotifications, seafrontGroup)
            }
        val page =
            timed("paginate") {
                PaginatedList.new(sortedPriorNotifications, pageNumber, pageSize, stats)
            }

        return timed("enrich page") {
            enrichPage(page, allPorts)
        }
    }

    private fun fetchAndEnrich(
        filter: PriorNotificationsFilter,
        allPorts: List<Port>,
        allRiskFactors: List<VesselRiskFactor>,
    ): List<PriorNotification> {
        val automaticPriorNotifications =
            timed("fetch logbook PNOs") {
                logbookReportRepository.findAllAcknowledgedPriorNotifications(filter)
            }
        val manualPriorNotifications =
            timed("fetch manual PNOs") {
                manualPriorNotificationRepository.findAll(filter)
            }

        return (automaticPriorNotifications + manualPriorNotifications)
            .onEach { it.enrich(allRiskFactors, allPorts, it.isManuallyCreated) }
            .let { enrichWithVessel(it) }
    }

    private fun enrichWithVessel(priorNotifications: List<PriorNotification>): List<PriorNotification> {
        val vesselsById =
            priorNotifications
                .asSequence()
                .filter { it.isManuallyCreated }
                .mapNotNull { it.logbookMessageAndValue.logbookMessage.vesselId }
                .distinct()
                .chunked(5000)
                .flatMap { vesselRepository.findVesselsByIds(it) }
                .toList()

        val vesselsByInternalReferenceNumber =
            priorNotifications
                .asSequence()
                .filter { !it.isManuallyCreated }
                .mapNotNull { it.logbookMessageAndValue.logbookMessage.internalReferenceNumber }
                .distinct()
                .chunked(5000)
                .flatMap { vesselRepository.findVesselsByInternalReferenceNumbers(it) }
                .toList()

        val vessels = vesselsById + vesselsByInternalReferenceNumber

        return priorNotifications.map { pno ->
            val vessel =
                if (pno.isManuallyCreated) {
                    vessels.find { it.id == pno.logbookMessageAndValue.logbookMessage.vesselId }
                } else {
                    vessels.find {
                        it.internalReferenceNumber ==
                            pno.logbookMessageAndValue.logbookMessage.internalReferenceNumber
                    }
                } ?: UNKNOWN_VESSEL

            pno.copy(vessel = vessel)
        }
    }

    private fun filter(
        priorNotifications: List<PriorNotification>,
        seafrontGroup: SeafrontGroup,
        states: List<PriorNotificationState>?,
        isInvalidated: Boolean?,
        isPriorNotificationZero: Boolean?,
    ): List<PriorNotification> =
        priorNotifications.filter { pno ->
            excludeForeignPortsExceptFrenchVessels(pno) &&
                seafrontGroup.hasSeafront(pno.seafront) &&
                matchesStatusFilter(pno, states, isInvalidated, isPriorNotificationZero)
        }

    private fun sort(
        priorNotifications: List<PriorNotification>,
        sortColumn: PriorNotificationsSortColumn,
        sortDirection: Sort.Direction,
    ): List<PriorNotification> =
        when (sortDirection) {
            Sort.Direction.ASC ->
                priorNotifications.sortedWith(
                    compareBy({ getSortKey(it, sortColumn) }, { it.logbookMessageAndValue.logbookMessage.id }),
                )
            Sort.Direction.DESC ->
                priorNotifications.sortedWith(
                    compareByDescending<PriorNotification> { getSortKey(it, sortColumn) }
                        .thenByDescending { it.logbookMessageAndValue.logbookMessage.id },
                )
        }

    private fun computeStats(
        priorNotifications: List<PriorNotification>,
        seafrontGroup: SeafrontGroup,
    ): PriorNotificationStats =
        PriorNotificationStats(
            perSeafrontGroupCount =
                SeafrontGroup.entries.associateWith { group ->
                    priorNotifications.count { group.hasSeafront(it.seafront) }
                },
        )

    private fun enrichPage(
        page: PaginatedList<PriorNotification, PriorNotificationStats>,
        allPorts: List<Port>,
    ): PaginatedList<PriorNotification, PriorNotificationStats> {
        val allGears = gearRepository.findAll()
        val allSpecies = speciesRepository.findAll()
        val reportings = fetchReportingsForPage(page)

        page.data.forEach { pno ->
            pno.enrichReportingCount(pno.vessel?.internalReferenceNumber, reportings)
            pno.logbookMessageAndValue.logbookMessage.enrichGearPortAndSpecyNames(allGears, allPorts, allSpecies)
        }

        return page
    }

    private fun fetchReportingsForPage(
        page: PaginatedList<PriorNotification, PriorNotificationStats>,
    ): List<Reporting> {
        val internalReferenceNumbers = page.data.mapNotNull { it.vessel?.internalReferenceNumber }

        return reportingRepository.findAll(
            ReportingFilter(
                vesselInternalReferenceNumbers = internalReferenceNumbers,
                isArchived = false,
                isDeleted = false,
                types = listOf(ReportingType.INFRACTION_SUSPICION, ReportingType.ALERT),
            ),
        )
    }

    private fun <T> timed(
        label: String,
        block: () -> T,
    ): T {
        val (result, duration) = measureTimedValue(block)
        logger.info("TIME_RECORD - '$label' took $duration.")

        return result
    }

    companion object {
        private fun excludeForeignPortsExceptFrenchVessels(priorNotification: PriorNotification): Boolean {
            val port = priorNotification.port // Mutable prop
            if (port == null || priorNotification.vessel == null) {
                return true
            }

            return priorNotification.vessel.isFrench() || port.isFrenchOrUnknown()
        }

        private fun matchesStatusFilter(
            priorNotification: PriorNotification,
            states: List<PriorNotificationState>?,
            isInvalidated: Boolean?,
            isPriorNotificationZero: Boolean?,
        ): Boolean =
            (states.isNullOrEmpty() && isInvalidated == null && isPriorNotificationZero == null) ||
                (!states.isNullOrEmpty() && states.contains(priorNotification.state)) ||
                (isInvalidated != null && priorNotification.logbookMessageAndValue.value.isInvalidated == isInvalidated) ||
                (isPriorNotificationZero != null && priorNotification.isPriorNotificationZero == isPriorNotificationZero)

        private fun getSortKey(
            priorNotification: PriorNotification,
            sortColumn: PriorNotificationsSortColumn,
        ): Comparable<*>? =
            when (sortColumn) {
                PriorNotificationsSortColumn.EXPECTED_ARRIVAL_DATE -> priorNotification.logbookMessageAndValue.value.predictedArrivalDatetimeUtc
                PriorNotificationsSortColumn.EXPECTED_LANDING_DATE -> priorNotification.logbookMessageAndValue.value.predictedLandingDatetimeUtc
                PriorNotificationsSortColumn.PORT_NAME -> priorNotification.port?.name
                PriorNotificationsSortColumn.VESSEL_NAME -> priorNotification.logbookMessageAndValue.logbookMessage.vesselName
                PriorNotificationsSortColumn.VESSEL_RISK_FACTOR -> priorNotification.logbookMessageAndValue.value.riskFactor
            }
    }
}
