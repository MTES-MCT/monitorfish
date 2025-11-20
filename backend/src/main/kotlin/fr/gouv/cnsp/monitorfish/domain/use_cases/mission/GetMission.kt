package fr.gouv.cnsp.monitorfish.domain.use_cases.mission

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionAndActions
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotFindException
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.RapportNavMissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.GetMissionActions
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope

@UseCase
class GetMission(
    private val missionRepository: MissionRepository,
    private val getMissionActions: GetMissionActions,
    private val rapportNavMissionActionsRepository: RapportNavMissionActionsRepository,
) {
    @Throws(CouldNotFindException::class)
    suspend fun execute(missionId: Int): MissionAndActions {
        return coroutineScope {
            val missionFuture = async { missionRepository.findById(missionId) }
            val actionsFuture = async { getMissionActions.execute(missionId) }

            try {
                val rapportNavActionsFuture =
                    async {
                        rapportNavMissionActionsRepository.findRapportNavMissionActionsById(missionId)
                    }

                return@coroutineScope MissionAndActions(
                    mission = missionFuture.await(),
                    actions = actionsFuture.await(),
                    hasRapportNavActions = rapportNavActionsFuture.await().containsActionsAddedByUnit,
                )
            } catch (e: Exception) {
                return@coroutineScope MissionAndActions(
                    mission = missionFuture.await(),
                    actions = actionsFuture.await(),
                    hasRapportNavActions = false,
                )
            }
        }
    }
}
