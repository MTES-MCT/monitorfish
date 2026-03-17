package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository

@UseCase
class GetReporting(
    private val reportingRepository: ReportingRepository,
) {
    fun execute(reportingId: Int): Reporting = reportingRepository.findById(reportingId)
}
