package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.env_mission_action.EnvMissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission.env_mission_action.EnvMissionActionType
import java.time.ZonedDateTime
import java.util.*

data class EnvMissionActionDataOutput(
    val id: UUID,
    val actionStartDateTimeUtc: ZonedDateTime? = null,
    val actionType: EnvMissionActionType,
    val observations: String? = null,
) {
    companion object {
        fun fromEnvMissionAction(envMissionAction: EnvMissionAction) =
            EnvMissionActionDataOutput(
                id = envMissionAction.id,
                actionStartDateTimeUtc = envMissionAction.actionStartDateTimeUtc,
                actionType = envMissionAction.actionType,
                observations = envMissionAction.observations,
            )
    }
}
