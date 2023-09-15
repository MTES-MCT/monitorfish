package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.LogbookReportRepository
import org.slf4j.LoggerFactory

@UseCase
class GetVesselLastTripNumbers(
    private val logbookReportRepository: LogbookReportRepository,
) {
    private val logger = LoggerFactory.getLogger(GetVesselLastTripNumbers::class.java)

    fun execute(internalReferenceNumber: String): List<String> {
        return logbookReportRepository.findLastTwoYearsTripNumbers(internalReferenceNumber)
    }
}
