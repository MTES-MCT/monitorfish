package fr.gouv.cnsp.monitorfish.domain.entities.health

import java.time.ZonedDateTime

data class Health(val datePositionReceived: ZonedDateTime,
                  val dateLastPosition: ZonedDateTime,
                  val dateLogbookMessageReceived: ZonedDateTime)