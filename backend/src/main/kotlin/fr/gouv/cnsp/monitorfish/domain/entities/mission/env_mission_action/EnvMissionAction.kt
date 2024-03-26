package fr.gouv.cnsp.monitorfish.domain.entities.mission.env_mission_action

import java.time.ZonedDateTime
import java.util.*

data class EnvMissionAction(
    val id: UUID,
    val actionStartDateTimeUtc: ZonedDateTime,
    val actionType: EnvMissionActionType,
)
