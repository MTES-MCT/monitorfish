package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class GetAllReportings(private val reportingRepository: ReportingRepository) {
    private val logger: Logger = LoggerFactory.getLogger(GetAllReportings::class.java)

    fun execute(): List<Reporting> {
        return reportingRepository.findAllCurrent()
    }
}
