package fr.gouv.cnsp.monitorfish.domain.use_cases.missions

import fr.gouv.cnsp.monitorfish.config.DatabaseProperties
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionAndActions
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.time.ZonedDateTime

/**
 * Get all missions and related action: actions query (`findMissionActionsIn`) is chunked by `missionsActionsChunkSize`
 */
@UseCase
class GetAllMissions(
    private val missionRepository: MissionRepository,
    private val missionActionsRepository: MissionActionsRepository,
    private val databaseProperties: DatabaseProperties,
) {
    private val logger: Logger = LoggerFactory.getLogger(GetAllMissions::class.java)

    fun execute(
        pageNumber: Int?,
        pageSize: Int?,
        startedAfterDateTime: ZonedDateTime?,
        startedBeforeDateTime: ZonedDateTime?,
        missionSources: List<String>?,
        missionTypes: List<String>?,
        missionStatuses: List<String>?,
        seaFronts: List<String>?,
    ): List<MissionAndActions> {
        val missions = missionRepository.findAllMissions(
            pageNumber,
            pageSize,
            startedAfterDateTime,
            startedBeforeDateTime,
            missionSources,
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
        logger.info("Got ${allMissionsActions.size} mission actions associated to fetched missions.")

        return missions.map { mission ->
            val missionActions = allMissionsActions
                .filter { it.missionId == mission.id }
                .sortedByDescending { it.actionDatetimeUtc }

            return@map MissionAndActions(mission, missionActions)
        }
    }
}
