package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import org.slf4j.LoggerFactory

@UseCase
class GetPositionAlertSpecifications(
    private val positionAlertSpecificationRepository: PositionAlertSpecificationRepository,
) {
    private val logger = LoggerFactory.getLogger(GetPositionAlertSpecifications::class.java)

    // TODO Add test
    fun execute(): List<PositionAlertSpecification> {
        val extraAlerts =
            AlertType.entries
                .filter { it.name !== AlertType.POSITION_ALERT.name }
                .mapNotNull { it.specification?.copy(type = it.name) }

        return positionAlertSpecificationRepository.findAllByIsDeletedIsFalse() + extraAlerts
    }
}
