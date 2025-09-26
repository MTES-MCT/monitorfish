package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import org.slf4j.LoggerFactory

@UseCase
class UpdatePositionAlertSpecification(
    private val positionAlertSpecificationRepository: PositionAlertSpecificationRepository,
) {
    private val logger = LoggerFactory.getLogger(UpdatePositionAlertSpecification::class.java)

    fun execute(
        id: Int,
        alertSpecification: PositionAlertSpecification,
    ) {
        val existingAlertSpecification =
            positionAlertSpecificationRepository.findById(id)
                ?: throw IllegalArgumentException("Alert specification with id $id not found")

        val updatedAlertSpecification =
            alertSpecification.copy(
                id = id,
                isActivated = existingAlertSpecification.isActivated,
                createdBy = existingAlertSpecification.createdBy,
                createdAtUtc = existingAlertSpecification.createdAtUtc,
                isInError = false,
                errorReason = null,
            )

        positionAlertSpecificationRepository.save(updatedAlertSpecification)
    }
}
