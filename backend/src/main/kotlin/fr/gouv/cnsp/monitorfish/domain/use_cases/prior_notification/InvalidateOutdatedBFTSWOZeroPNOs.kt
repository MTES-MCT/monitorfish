package fr.gouv.cnsp.monitorfish.domain.use_cases.prior_notification

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.prior_notification.filters.PriorNotificationsFilter
import fr.gouv.cnsp.monitorfish.domain.repositories.ManualPriorNotificationRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@UseCase
class InvalidateOutdatedBFTSWOZeroPNOs(
    private val manualPriorNotificationRepository: ManualPriorNotificationRepository,
) {
    private val logger = LoggerFactory.getLogger(InvalidateOutdatedBFTSWOZeroPNOs::class.java)

    // At every 5 minutes, after 1 minute of initial delay
    @Scheduled(fixedDelay = 300000, initialDelay = 6000)
    @Transactional
    fun execute() {
        manualPriorNotificationRepository
            .findAll(
                PriorNotificationsFilter(
                    isZero = true,
                    createdBefore = ZonedDateTime.now().minusHours(24),
                    specyCodes = listOf("BFT", "SWO"),
                    // assumes the arrival date is ~4 hours after the operation date
                    willArriveAfter = ZonedDateTime.now().minusHours(48),
                    willArriveBefore = ZonedDateTime.now().plusHours(48),
                ),
            ).forEach {
                if (it.reportId == null) {
                    logger.warn("Ignoring manual prior notification with no report id")
                    return
                }

                manualPriorNotificationRepository.invalidate(it.reportId)

                logger.info(
                    "Invalidated manual prior notification with report id: ${it.reportId} (valid before ${
                        it.createdAt?.plusHours(
                            24,
                        )
                    })",
                )
            }
    }
}
