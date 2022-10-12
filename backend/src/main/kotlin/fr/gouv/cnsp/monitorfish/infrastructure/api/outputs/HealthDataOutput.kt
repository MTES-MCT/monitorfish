package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.health.Health
import java.time.ZonedDateTime

data class HealthDataOutput(
    val datePositionReceived: ZonedDateTime,
    val dateLastPosition: ZonedDateTime,
    val dateLogbookMessageReceived: ZonedDateTime
) {
    companion object {
        fun fromHealth(health: Health) = HealthDataOutput(
            health.datePositionReceived,
            health.dateLastPosition,
            health.dateLogbookMessageReceived
        )
    }
}
