package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.annotation.Transactional

@UseCase
class ArchiveOutdatedReportings(private val reportingRepository: ReportingRepository) {
    private val logger = LoggerFactory.getLogger(ArchiveOutdatedReportings::class.java)

    // At every 5 minutes, after 1 minute of initial delay
    @Scheduled(fixedDelay = 300000, initialDelay = 6000)
    @Transactional
    fun execute() {
        val reportingCandidatesToArchive = reportingRepository.findUnarchivedReportings()

        val filteredReportingIdsToArchive =
            reportingCandidatesToArchive.filter {
                it.second.type == AlertTypeMapping.MISSING_FAR_ALERT ||
                    it.second.type == AlertTypeMapping.THREE_MILES_TRAWLING_ALERT ||
                    it.second.type == AlertTypeMapping.MISSING_DEP_ALERT
            }.map { it.first }

        logger.info("Found ${filteredReportingIdsToArchive.size} reportings to archive.")
        val numberOfArchivedReportings = reportingRepository.archiveReportings(filteredReportingIdsToArchive)

        logger.info("Archived $numberOfArchivedReportings reportings")
    }
}
