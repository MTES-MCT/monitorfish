package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingsFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits

@UseCase
class GetReportings(
    private val reportingRepository: ReportingRepository,
    private val getAllLegacyControlUnits: GetAllLegacyControlUnits,
) {
    fun execute(filter: ReportingsFilter): List<Pair<Reporting, LegacyControlUnit?>> {
        val reportings =
            reportingRepository
                .findAll(filter.toReportingFilter(hasPosition = true))
                .filter { filter.matches(it) }
        val controlUnits = getAllLegacyControlUnits.execute()

        return reportings.map { reporting ->
            val controlUnitId =
                when (reporting) {
                    is Reporting.InfractionSuspicion -> reporting.controlUnitId
                    is Reporting.Observation -> reporting.controlUnitId
                    is Reporting.Alert -> null
                }
            Pair(reporting, controlUnits.find { it.id == controlUnitId })
        }
    }
}
