package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.control_units.LegacyControlUnit
import fr.gouv.cnsp.monitorfish.domain.entities.mission.*
import java.time.ZonedDateTime

/**
@see monitorenv/backend/src/main/kotlin/fr/gouv/cacem/monitorenv/domain/entities/missions/MissionEntity.kt
for the full entity structure
 */
data class MissionWithActionsDataOutput(
    val id: Int,
    val missionTypes: List<MissionType>,
    val openBy: String? = null,
    val completedBy: String? = null,
    val observationsCacem: String? = null,
    val observationsCnsp: String? = null,
    val facade: String? = null,
    val geom: MultiPolygon? = null,
    val createdAtUtc: ZonedDateTime? = null,
    val updatedAtUtc: ZonedDateTime? = null,
    val envActions: List<EnvMissionActionDataOutput>,
    val startDateTimeUtc: ZonedDateTime,
    val endDateTimeUtc: ZonedDateTime? = null,
    val isGeometryComputedFromControls: Boolean,
    val missionSource: MissionSource,
    val hasMissionOrder: Boolean? = false,
    val isUnderJdp: Boolean? = false,
    val controlUnits: List<LegacyControlUnit> = listOf(),
    val actions: List<MissionActionDataOutput>,
) {
    companion object {
        fun fromMissionAndActions(missionAndActions: MissionAndActions) =
            MissionWithActionsDataOutput(
                id = missionAndActions.mission.id,
                missionTypes = missionAndActions.mission.missionTypes,
                openBy = missionAndActions.mission.openBy,
                completedBy = missionAndActions.mission.completedBy,
                observationsCacem = missionAndActions.mission.observationsCacem,
                observationsCnsp = missionAndActions.mission.observationsCnsp,
                facade = missionAndActions.mission.facade,
                geom = missionAndActions.mission.geom,
                createdAtUtc = missionAndActions.mission.createdAtUtc,
                updatedAtUtc = missionAndActions.mission.updatedAtUtc,
                envActions =
                    missionAndActions.mission.envActions
                        ?.map { EnvMissionActionDataOutput.fromEnvMissionAction(it) } ?: listOf(),
                startDateTimeUtc = missionAndActions.mission.startDateTimeUtc,
                endDateTimeUtc = missionAndActions.mission.endDateTimeUtc,
                isGeometryComputedFromControls = missionAndActions.mission.isGeometryComputedFromControls,
                missionSource = missionAndActions.mission.missionSource,
                hasMissionOrder = missionAndActions.mission.hasMissionOrder,
                isUnderJdp = missionAndActions.mission.isUnderJdp,
                controlUnits = missionAndActions.mission.controlUnits,
                actions = missionAndActions.actions.map { MissionActionDataOutput.fromMissionAction(it) },
            )
    }
}
