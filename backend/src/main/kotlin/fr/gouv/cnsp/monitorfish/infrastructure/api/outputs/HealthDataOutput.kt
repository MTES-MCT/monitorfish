package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.health.Health
import fr.gouv.cnsp.monitorfish.utils.CustomZonedDateTime

data class HealthDataOutput(
    val dateLastPositionReceivedByAPI: String,
    val dateLastPositionUpdatedByPrefect: String,
    val dateLogbookMessageReceived: String,
    val suddenDropOfPositionsReceived: Boolean,
) {
    companion object {
        fun fromHealth(health: Health) =
            HealthDataOutput(
                dateLastPositionUpdatedByPrefect =
                    CustomZonedDateTime(
                        health.dateLastPositionUpdatedByPrefect,
                    ).toString(),
                dateLastPositionReceivedByAPI =
                    CustomZonedDateTime(
                        health.dateLastPositionReceivedByAPI,
                    ).toString(),
                dateLogbookMessageReceived = CustomZonedDateTime(health.dateLogbookMessageReceived).toString(),
                suddenDropOfPositionsReceived = health.suddenDropOfPositionsReceived,
            )
    }
}
