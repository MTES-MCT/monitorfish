package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import org.slf4j.LoggerFactory

@UseCase
class ActivateOrDeactivateAlertSpecification(
    private val positionAlertSpecificationRepository: PositionAlertSpecificationRepository,
    private val pendingAlertRepository: PendingAlertRepository,
) {
    private val logger = LoggerFactory.getLogger(ActivateOrDeactivateAlertSpecification::class.java)

    fun execute(
        id: Int,
        isActivated: Boolean,
    ) {
        if (isActivated) {
            logger.info("Activating alert id $id.")
            positionAlertSpecificationRepository.activate(id)
        } else {
            logger.info("Deactivating alert id $id and deleting pending alerts.")
            positionAlertSpecificationRepository.deactivate(id)
            pendingAlertRepository.deleteAllByAlertId(id)
        }
    }
}
