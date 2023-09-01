package fr.gouv.cnsp.monitorfish.domain.use_cases.mission_actions

import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionAction
import fr.gouv.cnsp.monitorfish.domain.entities.mission_actions.MissionActionType
import java.time.ZonedDateTime

object TestUtils {
    fun getDummyMissionActions(missionIds: List<Int>): List<MissionAction> {
        return missionIds.map { missionId ->
            // Generate the number of mission actions corresponding to the id of the mission
            // i.e. if the missionId is 5, 5 actions with ids [1, 2, 3, 4, 5] will be generated
            return@map (1..missionId).toList().map {
                MissionAction(
                    id = (0..500).random(),
                    vesselId = 1,
                    missionId = it,
                    actionDatetimeUtc = ZonedDateTime.now(),
                    actionType = MissionActionType.LAND_CONTROL,
                    seizureAndDiversion = true,
                    isDeleted = false,
                    hasSomeGearsSeized = false,
                    hasSomeSpeciesSeized = false,
                    isFromPoseidon = false,
                )
            }
        }.flatten()
    }
}
