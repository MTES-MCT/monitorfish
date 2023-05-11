package fr.gouv.cnsp.monitorfish.domain.entities.mission

import java.time.ZonedDateTime

/**
@see monitorenv/backend/src/main/kotlin/fr/gouv/cacem/monitorenv/domain/entities/missions/MissionEntity.kt
for the full entity structure
 */
data class Mission(
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
    val missionSource: MissionSource,
    val isClosed: Boolean,
    val hasMissionOrder: Boolean? = false,
    val isUnderJdp: Boolean? = false,
    val controlUnits: List<ControlUnit> = listOf(),
)
