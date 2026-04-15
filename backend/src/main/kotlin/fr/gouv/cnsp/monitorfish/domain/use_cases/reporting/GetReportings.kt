package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.control_unit.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.control_units.GetAllLegacyControlUnits
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetReportings(
    private val reportingRepository: ReportingRepository,
    private val getAllLegacyControlUnits: GetAllLegacyControlUnits,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetReportings::class.java)

    fun execute(
        isArchived: Boolean?,
        isIUU: Boolean?,
        reportingType: ReportingType?,
        reportingPeriod: ReportingPeriod,
        startDate: ZonedDateTime?,
        endDate: ZonedDateTime?,
    ): List<Pair<Reporting, LegacyControlUnit?>> {
        val now = ZonedDateTime.now()
        val (afterCreationDate, beforeCreationDate) =
            when (reportingPeriod) {
                ReportingPeriod.TODAY ->
                    Pair(
                        now.toLocalDate().atStartOfDay(now.zone),
                        now.plusMinutes(1),
                    )

                ReportingPeriod.LAST_WEEK -> Pair(now.minusWeeks(1), now.plusMinutes(1))
                ReportingPeriod.LAST_MONTH -> Pair(now.minusMonths(1), now.plusMinutes(1))
                ReportingPeriod.LAST_3_MONTHS -> Pair(now.minusMonths(3), now.plusMinutes(1))
                ReportingPeriod.LAST_12_MONTHS -> Pair(now.minusMonths(12), now.plusMinutes(1))
                ReportingPeriod.CURRENT_YEAR ->
                    Pair(
                        now.withDayOfYear(1).toLocalDate().atStartOfDay(now.zone),
                        now.plusMinutes(1),
                    )

                ReportingPeriod.CUSTOM -> Pair(startDate, endDate)
                null -> Pair(null, null)
            }

        val infractionSuspicions = listOf(ReportingType.INFRACTION_SUSPICION, ReportingType.ALERT)
        val types =
            reportingType?.let {
                if (infractionSuspicions.contains(it)) {
                    infractionSuspicions
                } else {
                    listOf(it)
                }
            }

        val filter =
            ReportingFilter(
                isArchived = isArchived,
                isDeleted = false,
                isIUU = isIUU,
                types = types,
                afterCreationDate = afterCreationDate,
                beforeCreationDate = beforeCreationDate,
                hasPosition = true,
            )

        val reportings = reportingRepository.findAll(filter)
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
