package fr.gouv.cnsp.monitorfish.domain.use_cases.mission

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionAndActions
import fr.gouv.cnsp.monitorfish.domain.exceptions.CouldNotFindException
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.mission_actions.GetMissionActions
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope

@UseCase
class GetMission(
    private val missionRepository: MissionRepository,
    private val getMissionActions: GetMissionActions,
) {
    @Throws(CouldNotFindException::class)
    suspend fun execute(missionId: Int): MissionAndActions {
        return coroutineScope {
            val missionFuture = async {
                missionRepository.findById(missionId)
            }

            val actions = getMissionActions.execute(missionId)

            return@coroutineScope MissionAndActions(
                mission = missionFuture.await(),
                actions = actions,
            )
        }
    }
}
