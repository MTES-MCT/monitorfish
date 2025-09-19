package fr.gouv.cnsp.monitorfish.domain.use_cases.alert

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.PositionAlertSpecification
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionAlertSpecificationRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.VesselRepository
import org.slf4j.LoggerFactory

@UseCase
class GetPositionAlertSpecifications(
    private val positionAlertSpecificationRepository: PositionAlertSpecificationRepository,
    private val vesselRepository: VesselRepository
) {
    private val logger = LoggerFactory.getLogger(GetPositionAlertSpecifications::class.java)

    fun execute(): List<PositionAlertSpecification> {
        val alerts = positionAlertSpecificationRepository.findAllByIsDeletedIsFalse()
        val allAlertsVesselsIds = alerts.map { it.vesselIds }.flatten().distinct()
        val allAlertVessels = vesselRepository.findVesselsByIds(allAlertsVesselsIds)

        val alertsWithVessels = alerts.map { alert ->
            if (alert.vesselIds.isEmpty()) {
                return@map alert
            }

            val alertVessels =
                alert.vesselIds.mapNotNull { vesselId -> allAlertVessels.firstOrNull { it.id == vesselId } }

            return@map alert.copy(vessels = alertVessels)
        }

        val extraAlerts =
            AlertType.entries
                .filter { it.name !== AlertType.POSITION_ALERT.name }
                .mapNotNull { it.specification?.copy(type = it.name) }

        return alertsWithVessels + extraAlerts
    }
}
