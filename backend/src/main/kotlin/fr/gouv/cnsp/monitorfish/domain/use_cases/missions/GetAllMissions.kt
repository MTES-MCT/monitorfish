package fr.gouv.cnsp.monitorfish.domain.use_cases.missions

import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.Mission
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import java.time.ZonedDateTime

@UseCase
class GetAllMissions(private val missionRepository: MissionRepository) {
    fun execute(
        pageNumber: Int?,
        pageSize: Int?,
        startedAfterDateTime: ZonedDateTime?,
        startedBeforeDateTime: ZonedDateTime?,
        missionNatures: List<String>?,
        missionTypes: List<String>?,
        missionStatuses: List<String>?,
        seaFronts: List<String>?,
    ): List<Mission> {
        // TODO Add the fetch of the mission actions

        return missionRepository.findAllMissions(
            pageNumber,
            pageSize,
            startedAfterDateTime,
            startedBeforeDateTime,
            missionNatures,
            missionTypes,
            missionStatuses,
            seaFronts,
        )
    }
}
