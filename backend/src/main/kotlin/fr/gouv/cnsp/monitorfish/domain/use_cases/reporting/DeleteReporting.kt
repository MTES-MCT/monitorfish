package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class DeleteReporting(private val reportingRepository: ReportingRepository) {
  private val logger: Logger = LoggerFactory.getLogger(DeleteReporting::class.java)

  fun execute(id: Int) {
    logger.info("Deleting reporting $id")
    reportingRepository.delete(id)
  }
}
