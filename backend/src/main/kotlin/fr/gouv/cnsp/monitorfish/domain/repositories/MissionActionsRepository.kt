package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import java.time.ZonedDateTime

interface MissionActionsRepository {
    fun findVesselMissionActionsAfterDateTime(vesselId: Int, afterDateTime: ZonedDateTime): List<MissionAction>
    fun findMissionActions(missionId: Int): List<MissionAction>
    fun save(missionAction: MissionAction): MissionAction
}
