package fr.gouv.cnsp.monitorfish.domain.use_cases.reporting

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.ReportingRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.annotation.Transactional

@UseCase
class ArchiveOutdatedReportings(
    private val reportingRepository: ReportingRepository,
    private val alertSpecificationRepository: PositionAlertSpecificationRepository,
) {
    private val logger = LoggerFactory.getLogger(ArchiveOutdatedReportings::class.java)

    // At every 5 minutes, after 1 minute of initial delay
    @Scheduled(fixedDelay = 300000, initialDelay = 6000)
    @Transactional
    fun execute() {
        val reportingCandidatesToArchive = reportingRepository.findUnarchivedReportingsAfterNewVoyage()
        val expiredReportingsToArchive = reportingRepository.findExpiredReportings()

        val alertSpecificationsToArchive =
            alertSpecificationRepository
                .findAllByIsDeletedIsFalse()
                .filter { it.hasAutomaticArchiving }
                .mapNotNull { it.id }
        val extraAlertsToArchive =
            AlertType.entries
                .filter { it.name !== AlertType.POSITION_ALERT.name && it.specification?.hasAutomaticArchiving == true }

        val filteredReportingIdsToArchive =
            reportingCandidatesToArchive
                .filter {
                    extraAlertsToArchive.contains(it.second.type) || alertSpecificationsToArchive.contains(it.first)
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
