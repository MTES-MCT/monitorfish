package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@UseCase
class DeleteAlertsAfterValidityPeriod(
    private val alertSpecificationRepository: PositionAlertSpecificationRepository,
) {
    private val logger = LoggerFactory.getLogger(DeleteAlertsAfterValidityPeriod::class.java)

    // At every 5 minutes, after 1 minute of initial delay
    @Scheduled(fixedDelay = 300000, initialDelay = 6000)
    @Transactional
    fun execute() {
        val alertSpecificationsToDelete =
            alertSpecificationRepository
                .findAllByIsDeletedIsFalse()
                .filter { alert ->
                    alert.isDeletedAfterValidityPeriod &&
                        !alert.repeatEachYear &&
                        alert.validityEndDatetimeUtc?.let {
                            it < ZonedDateTime.now()
                        } ?: false
                }.forEach {
                    alertSpecificationRepository.delete(it.id!!)

                    logger.info("Deleted position alerts id: ${it.id} (valid before ${it.validityEndDatetimeUtc})")
                }
    }
}
