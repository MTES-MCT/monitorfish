package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.repositories.PendingAlertRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import org.slf4j.LoggerFactory

@UseCase
class DeleteAlertSpecification(
    private val positionAlertSpecificationRepository: PositionAlertSpecificationRepository,
    private val pendingAlertRepository: PendingAlertRepository,
) {
    private val logger = LoggerFactory.getLogger(DeleteAlertSpecification::class.java)

    fun execute(id: Int) {
        logger.info("Deleting alert specification $id.")
        positionAlertSpecificationRepository.delete(id)
        pendingAlertRepository.deleteAllByAlertId(id)
    }
}
