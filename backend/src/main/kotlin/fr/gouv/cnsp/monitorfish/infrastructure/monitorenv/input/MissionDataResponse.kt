package fr.gouv.cnsp.monitorfish.infrastructure.monitorenv.input

import fr.gouv.cnsp.monitorfish.domain.entities.mission.*
import kotlinx.serialization.Serializable
import java.time.ZonedDateTime

/**
 @see monitorenv/backend/src/main/kotlin/fr/gouv/cacem/monitorenv/domain/entities/missions/MissionEntity.kt
 for the full entity structure
 */
@Serializable
data class MissionDataResponse(
    val id: Int,
    val controlUnits: List<ControlUnit> = listOf(),
    val missionTypes: List<MissionType>,
    val openBy: String? = null,
    val closedBy: String? = null,
    val observationsCacem: String? = null,
    val observationsCnsp: String? = null,
    val facade: String? = null,
    val geom: MultiPolygon? = null,
    val createdAtUtc: String? = null,
    val updatedAtUtc: String? = null,
    val envActions: List<EnvMissionActionDataResponse>? = listOf(),
    val startDateTimeUtc: String,
    val endDateTimeUtc: String? = null,
    val isGeometryComputedFromControls: Boolean,
    val missionSource: MissionSource,
    val isClosed: Boolean,
    val hasMissionOrder: Boolean? = false,
    val isUnderJdp: Boolean? = false,
) {
    fun toMission() = Mission(
        id = id,
        controlUnits = controlUnits,
        missionTypes = missionTypes,
        openBy = openBy,
        closedBy = closedBy,
        observationsCacem = observationsCacem,
        observationsCnsp = observationsCnsp,
        facade = facade,
        geom = geom,
        startDateTimeUtc = ZonedDateTime.parse(startDateTimeUtc),
        endDateTimeUtc = endDateTimeUtc?.let { ZonedDateTime.parse(endDateTimeUtc) },
        isGeometryComputedFromControls = isGeometryComputedFromControls,
        missionSource = missionSource,
        isClosed = isClosed,
        hasMissionOrder = hasMissionOrder,
        isUnderJdp = isUnderJdp,
    )

    fun toFullMission(): Mission {
        val mission = toMission().copy(
            createdAtUtc = createdAtUtc?.let { ZonedDateTime.parse(createdAtUtc) },
            updatedAtUtc = updatedAtUtc?.let { ZonedDateTime.parse(updatedAtUtc) },
            envActions = envActions?.map { it.toEnvMissionAction() },
        )

        return mission
    }
}
