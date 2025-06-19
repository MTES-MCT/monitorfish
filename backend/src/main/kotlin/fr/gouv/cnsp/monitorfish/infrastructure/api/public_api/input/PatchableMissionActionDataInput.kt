package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.input

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.PatchableMissionAction
import java.time.ZonedDateTime
import java.util.*

/**
 * If the value is set as null in the JSON payload, the value will be Optional.isEmpty: we set is as null.
 * If the property is not passed to the JSON payload: we keep the existing value
 */
data class PatchableMissionActionDataInput(
    val actionDatetimeUtc: Optional<ZonedDateTime>?,
    val actionEndDatetimeUtc: Optional<ZonedDateTime>?,
    val observationsByUnit: Optional<String>?,
) {
    fun toPatchableMissionAction(): PatchableMissionAction =
        PatchableMissionAction(
            actionDatetimeUtc = actionDatetimeUtc,
            actionEndDatetimeUtc = actionEndDatetimeUtc,
            observationsByUnit = observationsByUnit,
        )
}
