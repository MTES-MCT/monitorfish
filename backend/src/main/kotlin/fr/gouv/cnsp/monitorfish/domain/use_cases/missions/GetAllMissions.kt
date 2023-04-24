package fr.gouv.cnsp.monitorfish.domain.use_cases.missions

import fr.gouv.cnsp.monitorfish.config.DatabaseProperties
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionAndActions
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import java.time.ZonedDateTime

@UseCase
class GetAllMissions(
    private val missionRepository: MissionRepository,
    private val missionActionsRepository: MissionActionsRepository,
    private val databaseProperties: DatabaseProperties,
) {
    fun execute(
        pageNumber: Int?,
        pageSize: Int?,
        startedAfterDateTime: ZonedDateTime?,
        startedBeforeDateTime: ZonedDateTime?,
        missionNatures: List<String>?,
        missionTypes: List<String>?,
        missionStatuses: List<String>?,
        seaFronts: List<String>?,
    ): List<MissionAndActions> {
        val missions = missionRepository.findAllMissions(
            pageNumber,
            pageSize,
            startedAfterDateTime,
            startedBeforeDateTime,
            missionNatures,
            missionTypes,
            missionStatuses,
            seaFronts,
        )

        val allMissionsActions = missions
            .chunked(databaseProperties.missionsActionsChunkSize)
            .map { chunkedMissions ->
                val ids = chunkedMissions.map { it.id }
                return@map missionActionsRepository.findMissionActionsIn(ids)
            }
            .flatten()

        return missions.map { mission ->
            val missionActions = allMissionsActions.filter { it.missionId == mission.id }

            return@map MissionAndActions(mission, missionActions)
        }
    }
}
