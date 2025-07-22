package fr.gouv.cnsp.monitorfish.domain.entities.activity

import java.time.ZonedDateTime

data class ActivityVisualization(
    val startDatetimeUtc: ZonedDateTime,
    val endDatetimeUtc: ZonedDateTime,
    val html: String,
)
