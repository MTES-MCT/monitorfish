package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.health.Health
import java.time.ZonedDateTime

data class HealthDataOutput(
    val dateLastPositionReceivedByAPI: ZonedDateTime,
    val dateLastPositionUpdatedByPrefect: ZonedDateTime,
    val dateLogbookMessageReceived: ZonedDateTime,
    val suddenDropOfPositionsReceived: Boolean,
) {
    companion object {
        fun fromHealth(health: Health) = HealthDataOutput(
            dateLastPositionUpdatedByPrefect = health.dateLastPositionUpdatedByPrefect,
            dateLastPositionReceivedByAPI = health.dateLastPositionReceivedByAPI,
            dateLogbookMessageReceived = health.dateLogbookMessageReceived,
            suddenDropOfPositionsReceived = health.suddenDropOfPositionsReceived,
        )
    }
}
