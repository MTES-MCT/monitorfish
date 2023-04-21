package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.mission.*
import java.time.ZonedDateTime

/**
@see monitorenv/backend/src/main/kotlin/fr/gouv/cacem/monitorenv/domain/entities/missions/MissionEntity.kt
for the full entity structure
 */
data class MissionDataOutput(
    val id: Int,
    val missionTypes: List<MissionType>,
    val missionNature: List<MissionNature>? = null,
    val openBy: String? = null,
    val closedBy: String? = null,
    val observationsCacem: String? = null,
    val observationsCnsp: String? = null,
    val facade: String? = null,
    val geom: MultiPolygon? = null,
    val startDateTimeUtc: ZonedDateTime,
    val endDateTimeUtc: ZonedDateTime? = null,
    val missionSource: MissionSource,
    val isClosed: Boolean,
    val hasMissionOrder: Boolean? = false,
    val isUnderJdp: Boolean? = false,
    val controlUnits: List<ControlUnit> = listOf(),
) {
    companion object {
        fun fromMission(mission: Mission) = MissionDataOutput(
            id = mission.id,
            missionTypes = mission.missionTypes,
            missionNature = mission.missionNature,
            openBy = mission.openBy,
            closedBy = mission.closedBy,
            observationsCacem = mission.observationsCacem,
            observationsCnsp = mission.observationsCnsp,
            facade = mission.facade,
            geom = mission.geom,
            startDateTimeUtc = mission.startDateTimeUtc,
            endDateTimeUtc = mission.endDateTimeUtc,
            missionSource = mission.missionSource,
            isClosed = mission.isClosed,
            hasMissionOrder = mission.hasMissionOrder,
            isUnderJdp = mission.isUnderJdp,
            controlUnits = mission.controlUnits,
        )
    }
}
