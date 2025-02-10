package fr.gouv.cnsp.monitorfish.domain.use_cases.mission

import fr.gouv.cnsp.monitorfish.config.DatabaseProperties
import fr.gouv.cnsp.monitorfish.config.UseCase
import fr.gouv.cnsp.monitorfish.domain.entities.mission.MissionAndActions
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionActionsRepository
import fr.gouv.cnsp.monitorfish.domain.repositories.MissionRepository
import fr.gouv.cnsp.monitorfish.domain.use_cases.mission.dtos.InfractionFilterDTO
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
        infractionsFilter: List<InfractionFilterDTO>?,
        isUnderJdp: Boolean?,
    ): List<MissionAndActions> {
        val missions =
            missionRepository.findAllMissions(
                pageNumber,
                pageSize,
                startedAfterDateTime,
                startedBeforeDateTime,
                missionSources,
                missionTypes,
                missionStatuses,
                seaFronts,
            )

        val filteredMissions =
            missions.filter { filteredMission ->
                isUnderJdp?.let { filteredMission.isUnderJdp == isUnderJdp } ?: true
            }

        val allMissionsActions =
            filteredMissions
                .chunked(databaseProperties.missionsActionsChunkSize)
                .map { chunkedMissions ->
                    val ids = chunkedMissions.map { it.id }
                    return@map missionActionsRepository.findMissionActionsIn(ids)
                }.flatten()
        logger.info("Got ${allMissionsActions.size} mission actions associated to fetched missions.")

        return filteredMissions
            .map { mission ->
                val missionActions =
                    allMissionsActions
                        .filter { it.missionId == mission.id }
                        .sortedByDescending { it.actionDatetimeUtc }

                return@map MissionAndActions(mission, missionActions)
            }.filter { filteredMission ->
                filterInfractions(infractionsFilter, filteredMission)
            }
    }

    private fun filterInfractions(
        infractionsFilter: List<InfractionFilterDTO>?,
        filteredMission: MissionAndActions,
    ): Boolean {
        // If the filter is null or if all filters are selected, we return true.
        if (infractionsFilter == null || infractionsFilter.size == InfractionFilterDTO.entries.size) {
            return true
        }

        return infractionsFilter.all { filter ->
            when (filter) {
                InfractionFilterDTO.WITHOUT_INFRACTIONS ->
                    // With this filter selected, every action must have no infractions.
                    filteredMission.actions.all { it.containsNoInfractions() }
                InfractionFilterDTO.INFRACTION_WITH_RECORD ->
                    // At least one action should have an infraction with record.
                    filteredMission.actions.any { it.containsInfractionsWithRecord() }
                InfractionFilterDTO.INFRACTION_WITHOUT_RECORD ->
                    // At least one action should have an infraction without record.
                    filteredMission.actions.any { it.containsInfractionsWithoutRecord() }
            }
        }
    }
}
