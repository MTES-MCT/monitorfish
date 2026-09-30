package fr.gouv.cnsp.monitorfish.domain.entities.reporting

import java.time.ZonedDateTime

enum class ReportingPeriod {
    TODAY,
    LAST_WEEK,
    LAST_MONTH,
    LAST_3_MONTHS,
    LAST_12_MONTHS,
    CURRENT_YEAR,
    CUSTOM,
    ;

    /**
     * Resolve this period into an `(after, before)` creation date range.
     *
     * [startDate] and [endDate] are only used by [CUSTOM].
     */
    fun toDateRange(
        startDate: ZonedDateTime? = null,
        endDate: ZonedDateTime? = null,
        now: ZonedDateTime = ZonedDateTime.now(),
    ): Pair<ZonedDateTime?, ZonedDateTime?> =
        when (this) {
            TODAY -> Pair(now.toLocalDate().atStartOfDay(now.zone), now.plusMinutes(1))
            LAST_WEEK -> Pair(now.minusWeeks(1), now.plusMinutes(1))
            LAST_MONTH -> Pair(now.minusMonths(1), now.plusMinutes(1))
            LAST_3_MONTHS -> Pair(now.minusMonths(3), now.plusMinutes(1))
            LAST_12_MONTHS -> Pair(now.minusMonths(12), now.plusMinutes(1))
            CURRENT_YEAR -> Pair(now.withDayOfYear(1).toLocalDate().atStartOfDay(now.zone), now.plusMinutes(1))
            CUSTOM -> Pair(startDate, endDate)
        }
}
