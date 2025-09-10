package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlert
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertRepository
import org.slf4j.LoggerFactory

@UseCase
class GetPositionAlerts(
    private val positionAlertRepository: PositionAlertRepository,
) {
    private val logger = LoggerFactory.getLogger(GetPositionAlerts::class.java)

    fun execute(): List<PositionAlert> = positionAlertRepository.findAllByIsDeletedIsFalse()
}
