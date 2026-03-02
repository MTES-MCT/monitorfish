package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingPeriod
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.ReportingType
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.filters.ReportingFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

@UseCase
class GetReportings(
    private val reportingRepository: ReportingRepository,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetReportings::class.java)

    fun execute(
        isArchived: Boolean?,
        isIUU: Boolean?,
        reportingType: ReportingType?,
        reportingPeriod: ReportingPeriod,
        startDate: ZonedDateTime?,
        endDate: ZonedDateTime?,
    ): List<Reporting> {
        val now = ZonedDateTime.now()
        val (afterCreationDate, beforeCreationDate) =
            when (reportingPeriod) {
                ReportingPeriod.TODAY ->
                    Pair(
                        now.toLocalDate().atStartOfDay(now.zone),
                        now,
                    )

                ReportingPeriod.LAST_WEEK -> Pair(now.minusWeeks(1), now)
                ReportingPeriod.LAST_MONTH -> Pair(now.minusMonths(1), now)
                ReportingPeriod.LAST_3_MONTHS -> Pair(now.minusMonths(3), now)
                ReportingPeriod.LAST_12_MONTHS -> Pair(now.minusMonths(12), now)
                ReportingPeriod.CURRENT_YEAR ->
                    Pair(
                        now.withDayOfYear(1).toLocalDate().atStartOfDay(now.zone),
                        now,
                    )

                ReportingPeriod.CUSTOM -> Pair(startDate, endDate)
                null -> Pair(null, null)
            }

        val filter =
            ReportingFilter(
                isArchived = isArchived,
                isDeleted = false,
                isIUU = isIUU,
                types = reportingType?.let { listOf(it) },
                afterCreationDate = afterCreationDate,
                beforeCreationDate = beforeCreationDate,
                hasPosition = true,
            )

        return reportingRepository.findAll(filter)
    }
}
