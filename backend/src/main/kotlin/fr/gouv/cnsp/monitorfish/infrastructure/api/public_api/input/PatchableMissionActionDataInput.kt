package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.input

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.PatchableMissionAction
import java.time.ZonedDateTime
import java.util.*

data class PatchableMissionActionDataInput(
    val actionDatetimeUtc: Optional<ZonedDateTime>?,
    val actionEndDatetimeUtc: Optional<ZonedDateTime>?,
    val observationsByUnit: Optional<String>?,
) {
    fun toPatchableMissionAction(): PatchableMissionAction {
        return PatchableMissionAction(
            actionDatetimeUtc = actionDatetimeUtc,
            actionEndDatetimeUtc = actionEndDatetimeUtc,
            observationsByUnit = observationsByUnit,
        )
    }
}
