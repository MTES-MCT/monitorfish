package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import org.slf4j.LoggerFactory

@UseCase
class GetVesselTripNumbers(
    private val logbookReportRepository: LogbookReportRepository,
) {
    private val logger = LoggerFactory.getLogger(GetVesselTripNumbers::class.java)

    fun execute(internalReferenceNumber: String): List<String> =
        logbookReportRepository.findAllTrips(internalReferenceNumber).map { it.tripNumber }
}
