package fr.gouv.cnsp.monitorfish.domain.entities.health

import java.time.ZonedDateTime

data class Health(
    val dateLastPositionUpdatedByPrefect: ZonedDateTime,
    val dateLastPositionReceivedByAPI: ZonedDateTime,
    val dateLogbookMessageReceived: ZonedDateTime,
)
