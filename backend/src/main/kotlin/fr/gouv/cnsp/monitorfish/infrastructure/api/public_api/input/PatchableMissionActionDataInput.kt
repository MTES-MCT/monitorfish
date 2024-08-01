package fr.gouv.cnsp.monitorfish.infrastructure.api.public_api.input

import fr.gouv.cnsp.monitorfish.domain.entities.mission.mission_actions.PatchableMissionAction
import java.time.ZonedDateTime
import java.util.*

data class PatchableMissionActionDataInput(
    val actionEndDatetimeUtc: Optional<ZonedDateTime>?,
    val observationsByUnit: Optional<String>?,
) {
    fun toPatchableMissionAction(): PatchableMissionAction {
        return PatchableMissionAction(
            actionEndDatetimeUtc = actionEndDatetimeUtc,
            observationsByUnit = observationsByUnit,
        )
    }
}
