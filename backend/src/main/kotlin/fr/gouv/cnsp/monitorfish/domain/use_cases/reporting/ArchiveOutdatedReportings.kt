package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.annotation.Transactional

@UseCase
class ArchiveOutdatedReportings(
    private val reportingRepository: ReportingRepository,
) {
    private val logger = LoggerFactory.getLogger(ArchiveOutdatedReportings::class.java)

    // At every 5 minutes, after 1 minute of initial delay
    @Scheduled(fixedDelay = 300000, initialDelay = 6000)
    @Transactional
    fun execute() {
        val reportingCandidatesToArchive = reportingRepository.findUnarchivedReportingsAfterNewVoyage()
        val expiredReportingsToArchive = reportingRepository.findExpiredReportings()

        val filteredReportingIdsToArchive =
            reportingCandidatesToArchive
                .filter {
                    it.second.type == AlertType.MISSING_FAR_ALERT ||
                        it.second.type == AlertType.MISSING_FAR_48_HOURS_ALERT ||
                        it.second.alertId == 1 ||
                        // THREE_MILES_TRAWLING_ALERT
                        it.second.type == AlertType.MISSING_DEP_ALERT ||
                        it.second.type == AlertType.SUSPICION_OF_UNDER_DECLARATION_ALERT ||
                        it.second.alertId == 10 ||
                        // BLI_BYCATCH_MAX_WEIGHT_EXCEEDED_ALERT
                        it.second.alertId == 9 // NEAFC_FISHING_ALERT
                }.map { it.first }

        logger.info("Found ${filteredReportingIdsToArchive.size} reportings alerts to archive.")
        logger.info("Found ${expiredReportingsToArchive.size} expired reportings to archive.")
        val numberOfArchivedReportings =
            reportingRepository.archiveReportings(
                filteredReportingIdsToArchive + expiredReportingsToArchive,
            )

        logger.info("Archived $numberOfArchivedReportings reportings")
    }
}
