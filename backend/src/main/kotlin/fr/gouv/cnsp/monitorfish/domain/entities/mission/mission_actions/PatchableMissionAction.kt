package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

import java.time.ZonedDateTime
import java.util.*

data class PatchableMissionAction(
    val actionDatetimeUtc: Optional<ZonedDateTime>?,
    val actionEndDatetimeUtc: Optional<ZonedDateTime>?,
    val observationsByUnit: Optional<String>?,
)
