package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

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
    val closedBy: String? = null,
    val observationsCacem: String? = null,
    val observationsCnsp: String? = null,
    val facade: String? = null,
    val geom: MultiPolygon? = null,
    val startDateTimeUtc: ZonedDateTime,
    val endDateTimeUtc: ZonedDateTime? = null,
    val isGeometryComputedFromControls: Boolean,
    val missionSource: MissionSource,
    val isClosed: Boolean,
    val hasMissionOrder: Boolean? = false,
    val isUnderJdp: Boolean? = false,
    val controlUnits: List<ControlUnit> = listOf(),
    val actions: List<MissionActionDataOutput>,
) {
    companion object {
        fun fromMissionAndActions(missionAndActions: MissionAndActions) = MissionWithActionsDataOutput(
            id = missionAndActions.mission.id,
            missionTypes = missionAndActions.mission.missionTypes,
            openBy = missionAndActions.mission.openBy,
            closedBy = missionAndActions.mission.closedBy,
            observationsCacem = missionAndActions.mission.observationsCacem,
            observationsCnsp = missionAndActions.mission.observationsCnsp,
            facade = missionAndActions.mission.facade,
            geom = missionAndActions.mission.geom,
            startDateTimeUtc = missionAndActions.mission.startDateTimeUtc,
            endDateTimeUtc = missionAndActions.mission.endDateTimeUtc,
            isGeometryComputedFromControls = missionAndActions.mission.isGeometryComputedFromControls,
            missionSource = missionAndActions.mission.missionSource,
            isClosed = missionAndActions.mission.isClosed,
            hasMissionOrder = missionAndActions.mission.hasMissionOrder,
            isUnderJdp = missionAndActions.mission.isUnderJdp,
            controlUnits = missionAndActions.mission.controlUnits,
            actions = missionAndActions.actions.map { MissionActionDataOutput.fromMissionAction(it) },
        )
    }
}
