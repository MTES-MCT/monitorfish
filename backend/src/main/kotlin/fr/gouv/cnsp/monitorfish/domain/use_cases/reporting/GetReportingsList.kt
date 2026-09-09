package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.facade.Seafront
import fr.gouv.cnsp.monitorfish.domain.entities.facade.SeafrontGroup
import fr.gouv.cnsp.monitorfish.domain.entities.infraction.Infraction
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingOrigin
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingStats
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingsFilter
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.sorters.ReportingsSortColumn
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.exceptions.NatinfCodeNotFoundException
import fr.gouv.cnsp.monitorfish.domain.repositories.InfractionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import fr.gouv.cnsp.monitorfish.domain.utils.PaginatedList
import fr.gouv.cnsp.monitorfish.utils.StringUtils
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.data.domain.Sort

/**
 * Reportings of the side window list.
 *
 * Filtering, sorting and pagination all happen in memory — as in `GetPriorNotifications` — because
 * the seafront, the title and the source live in the `reportings.value` jsonb column. Only the
 * returned page is enriched, so the per-reporting under-charter and NATINF lookups cost
 * `pageSize` queries and not one per matching reporting.
 */
@UseCase
class GetReportingsList(
    private val reportingRepository: ReportingRepository,
    private val vesselRepository: VesselRepository,
    private val infractionRepository: InfractionRepository,
    private val getAllLegacyControlUnits: GetAllLegacyControlUnits,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetReportingsList::class.java)

    fun execute(
        filter: ReportingsFilter,
        seafrontGroup: SeafrontGroup,
        searchQuery: String?,
        absentVessel: Boolean?,
        sortColumn: ReportingsSortColumn,
        sortDirection: Sort.Direction,
        pageNumber: Int,
        pageSize: Int,
    ): PaginatedList<Pair<Reporting, LegacyControlUnit?>, ReportingStats> {
        val controlUnits = getAllLegacyControlUnits.execute()

        val allReportings =
            reportingRepository
                .findAll(filter.toReportingFilter(absentVessel = absentVessel))
                .filter { filter.matches(it) }

        val filteredReportings =
            allReportings
                .filter { seafrontGroup.hasSeafront(seafrontOf(it)) }
                .filter { matchesSearchQuery(it, searchQuery) }

        val sortedReportings = sort(filteredReportings, sortColumn, sortDirection)
        val stats = computeStats(allReportings)

        val page =
            PaginatedList.new(
                items = sortedReportings.map { Pair(it, controlUnitOf(it, controlUnits)) },
                pageNumber = pageNumber,
                pageSize = pageSize,
                extraData = stats,
            )

        return page.copy(data = page.data.map { (reporting, controlUnit) -> Pair(enrich(reporting), controlUnit) })
    }

    private fun computeStats(reportings: List<Reporting>): ReportingStats =
        ReportingStats(
            perSeafrontGroupCount =
                SeafrontGroup.entries.associateWith { group ->
                    reportings.count { group.hasSeafront(seafrontOf(it)) }
                },
        )

    private fun sort(
        reportings: List<Reporting>,
        sortColumn: ReportingsSortColumn,
        sortDirection: Sort.Direction,
    ): List<Reporting> {
        val comparator =
            when (sortColumn) {
                ReportingsSortColumn.ORIGIN ->
                    compareBy<Reporting> { ReportingOrigin.fromReporting(it).name }

                ReportingsSortColumn.REPORTING_DATE -> compareBy { it.reportingDate }
                ReportingsSortColumn.THREAT -> compareBy { threatOf(it) }
                ReportingsSortColumn.TITLE -> compareBy { titleOf(it) }
                ReportingsSortColumn.TYPE -> compareBy { it.type.name }
                ReportingsSortColumn.VESSEL_NAME -> compareBy { it.vesselName ?: "" }
                // Tie-break on the id so that pagination is stable across pages.
            }.thenBy { it.id }

        return reportings.sortedWith(if (sortDirection == Sort.Direction.ASC) comparator else comparator.reversed())
    }

    private fun matchesSearchQuery(
        reporting: Reporting,
        searchQuery: String?,
    ): Boolean {
        if (searchQuery.isNullOrBlank()) {
            return true
        }

        val needle = normalize(searchQuery)
        val haystack =
            listOfNotNull(
                reporting.vesselName,
                reporting.cfr,
                reporting.externalMarker,
                reporting.ircs,
                titleOf(reporting),
                threatOf(reporting),
                threatCharacterizationOf(reporting),
            )

        return haystack.any { normalize(it).contains(needle) }
    }

    private fun normalize(value: String): String = StringUtils.removeAccents(value).lowercase()

    private fun controlUnitOf(
        reporting: Reporting,
        controlUnits: List<LegacyControlUnit>,
    ): LegacyControlUnit? {
        val controlUnitId =
            when (reporting) {
                is Reporting.InfractionSuspicion -> reporting.controlUnitId
                is Reporting.Observation -> reporting.controlUnitId
                is Reporting.Alert -> null
            }

        return controlUnits.find { it.id == controlUnitId }
    }

    private fun enrich(reporting: Reporting): Reporting {
        val underCharter = getIsUnderCharter(reporting)

        return when (reporting) {
            is Reporting.Alert ->
                reporting.copy(infraction = getInfraction(reporting), underCharter = underCharter)

            is Reporting.InfractionSuspicion ->
                enrichInfractions(reporting).copy(underCharter = underCharter)

            is Reporting.Observation -> reporting.copy(underCharter = underCharter)
        }
    }

    private fun enrichInfractions(reporting: Reporting.InfractionSuspicion): Reporting.InfractionSuspicion {
        val enriched =
            reporting.infractions.map { item ->
                item.copy(infraction = findInfraction(item.natinfCode))
            }

        return reporting.copy(infractions = enriched)
    }

    private fun getInfraction(reporting: Reporting.Alert): Infraction? = findInfraction(reporting.natinfCode)

    private fun findInfraction(natinfCode: Int): Infraction? =
        try {
            infractionRepository.findInfractionByNatinfCode(natinfCode)
        } catch (e: NatinfCodeNotFoundException) {
            logger.warn(e.message)

            null
        }

    private fun getIsUnderCharter(reporting: Reporting): Boolean? =
        try {
            val vesselIdentifier = reporting.vesselIdentifier

            when (vesselIdentifier) {
                VesselIdentifier.INTERNAL_REFERENCE_NUMBER -> {
                    val cfr =
                        requireNotNull(reporting.cfr) {
                            "The fields 'internalReferenceNumber' must be not null when the vessel identifier is INTERNAL_REFERENCE_NUMBER."
                        }
                    vesselRepository.findUnderCharterForVessel(vesselIdentifier, cfr)
                }

                VesselIdentifier.IRCS -> {
                    val ircs =
                        requireNotNull(reporting.ircs) {
                            "The fields 'ircs' must be not null when the vessel identifier is IRCS."
                        }
                    vesselRepository.findUnderCharterForVessel(vesselIdentifier, ircs)
                }

                VesselIdentifier.EXTERNAL_REFERENCE_NUMBER -> {
                    val externalMarker =
                        requireNotNull(reporting.externalMarker) {
                            "The fields 'externalReferenceNumber' must be not null when the vessel identifier is EXTERNAL_REFERENCE_NUMBER."
                        }
                    vesselRepository.findUnderCharterForVessel(vesselIdentifier, externalMarker)
                }

                else -> null
            }
        } catch (e: Throwable) {
            logger.debug(
                "Last position not found for vessel " +
                    "\"${reporting.cfr}/${reporting.ircs}/${reporting.externalMarker}\" " +
                    "and vessel identifier \"${reporting.vesselIdentifier}\": ${e.message}",
            )

            null
        }

    companion object {
        /** `Reporting.seaFront` is a free-form string, so an unknown value must not blow up the list. */
        private fun seafrontOf(reporting: Reporting): Seafront? = Seafront.fromOrNull(reporting.seaFront)

        private fun titleOf(reporting: Reporting): String =
            when (reporting) {
                is Reporting.Alert -> reporting.name
                is Reporting.InfractionSuspicion -> reporting.title
                is Reporting.Observation -> reporting.title
            }

        private fun threatOf(reporting: Reporting): String =
            when (reporting) {
                is Reporting.Alert -> reporting.threat
                is Reporting.InfractionSuspicion -> reporting.infractions.joinToString(" ") { it.threat }
                is Reporting.Observation -> ""
            }

        private fun threatCharacterizationOf(reporting: Reporting): String =
            when (reporting) {
                is Reporting.Alert -> reporting.threatCharacterization
                is Reporting.InfractionSuspicion ->
                    reporting.infractions.joinToString(" ") { it.threatCharacterization }
                is Reporting.Observation -> ""
            }
    }
}
