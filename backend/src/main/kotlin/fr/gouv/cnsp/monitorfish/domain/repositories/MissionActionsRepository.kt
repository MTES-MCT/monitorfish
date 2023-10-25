package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import java.time.ZonedDateTime

interface MissionActionsRepository {
    fun findById(id: Int): MissionAction
    fun findByMissionId(missionId: Int): List<MissionAction>
    fun findVesselMissionActionsAfterDateTime(vesselId: Int, afterDateTime: ZonedDateTime): List<MissionAction>
    fun findControlsInDates(beforeDateTime: ZonedDateTime, afterDateTime: ZonedDateTime): List<MissionAction>
    fun findMissionActionsIn(missionIds: List<Int>): List<MissionAction>
    fun save(missionAction: MissionAction): MissionAction
}
