package fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions

import java.time.ZonedDateTime
import java.util.*

/**
 * If the value is set as null in the JSON payload, the value will be Optional.isEmpty: we set is as null.
 * If the property is not passed to the JSON payload: we keep the existing value
 */
data class PatchableMissionAction(
    var actionDatetimeUtc: Optional<ZonedDateTime>?,
    var actionEndDatetimeUtc: Optional<ZonedDateTime>?,
    var observationsByUnit: Optional<String>?,
)
