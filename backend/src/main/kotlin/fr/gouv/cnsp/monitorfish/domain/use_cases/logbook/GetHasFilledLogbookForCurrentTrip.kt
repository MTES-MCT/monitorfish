package fr.gouv.cnsp.monitorfish.domain.use_cases.logbook

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import org.slf4j.LoggerFactory

@UseCase
class GetHasFilledLogbookForCurrentTrip(
    private val logbookReportRepository: LogbookReportRepository,
) {
    private val logger = LoggerFactory.getLogger(GetHasFilledLogbookForCurrentTrip::class.java)

    fun execute(cfr: String): Boolean {
        /**
         * From logbook_snapshot, 98.7% of trips are included in 7 days.
         */
        val sevenDaysInHours = 168

        return logbookReportRepository
            .getCurrentTripDepAndPositionAtSeaDateTime(
                cfr = cfr,
                hoursFromNow = sevenDaysInHours,
            )?.let {
                it.firstPositionAtSeaOfLastTripDateTime?.let { firstPositionAtSeaOfLastTripDateTime ->
                    // We substract 6 hours to avoid missing DEP sent before first position at sea
                    it.departureDateTime >= firstPositionAtSeaOfLastTripDateTime.minusHours(6)
                } ?: false
            } ?: false
    }
}
