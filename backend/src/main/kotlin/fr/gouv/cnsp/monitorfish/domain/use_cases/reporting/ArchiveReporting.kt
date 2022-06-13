package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory

@UseCase
class ArchiveReporting(private val reportingRepository: ReportingRepository) {
    private val logger: Logger = LoggerFactory.getLogger(ArchiveReporting::class.java)

    fun execute(id: Int) {
        logger.info("Archiving reporting $id")
        reportingRepository.archive(id)
    }
}
