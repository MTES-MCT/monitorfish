package fr.gouv.cnsp.monitorfish.domain.entities

import java.time.ZonedDateTime

data class Health(val datePositionReceived: ZonedDateTime,
                  val dateLastPosition: ZonedDateTime,
                  val dateERSMessageReceived: ZonedDateTime)