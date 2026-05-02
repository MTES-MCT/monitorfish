package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.JpaLogbookReportRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.JpaManualPriorNotificationRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.annotation.Transactional
import java.time.ZoneId
import java.time.ZonedDateTime

@UseCase
class InvalidateOutdatedBFTSWOZeroPNOs(
    private val jpaManualPriorNotificationRepository: JpaManualPriorNotificationRepository,
    private val jpaLogbookReportRepository: JpaLogbookReportRepository,
) {
    private val logger = LoggerFactory.getLogger(InvalidateOutdatedBFTSWOZeroPNOs::class.java)

    // At every 5 minutes, after 1 minute of initial delay
    @Scheduled(fixedDelay = 300000, initialDelay = 6000)
    @Transactional
    fun execute() {
        val filter =
            PriorNotificationsFilter(
                isZero = true,
                createdBefore = ZonedDateTime.now().minusHours(24),
                specyCodes = listOf("BFT", "SWO"),
                // TODO: refactor the willArriveBefore and willArriveAfter fields to be nullable
                willArriveAfter = ZonedDateTime.of(Integer.MIN_VALUE, 0, 0, 0, 0, 0, 0, ZoneId.of("UTC")),
                willArriveBefore = ZonedDateTime.of(Integer.MAX_VALUE, 0, 0, 0, 0, 0, 0, ZoneId.of("UTC")),
            )

        val manual =
            jpaManualPriorNotificationRepository
                .findAll(filter)
                .forEach {
                    if (it.reportId == null) {
                        return // QUESTION: should throw?
                    }

                    jpaManualPriorNotificationRepository.invalidate(it.reportId)

                    logger.info(
                        "Invalidated manual prior notification with report id: ${it.reportId} (valid before ${
                            it.createdAt?.plusHours(
                                24,
                            )
                        })",
                    )
                }

        val logbook =
            jpaLogbookReportRepository
                .findAllAcknowledgedPriorNotifications(filter) // QUESTION: is "acknowledged" good?
                .forEach {
                    if (it.reportId == null) {
                        return // QUESTION: should throw?
                    }

                    jpaLogbookReportRepository.invalidate(
                        it.reportId,
                        it.logbookMessageAndValue.logbookMessage.operationDateTime,
                    )

                    logger.info(
                        "Invalidated logbook prior notification with report id: ${it.reportId} (valid before ${
                            it.createdAt?.plusHours(
                                24,
                            )
                        })",
                    )
                }
    }
}
