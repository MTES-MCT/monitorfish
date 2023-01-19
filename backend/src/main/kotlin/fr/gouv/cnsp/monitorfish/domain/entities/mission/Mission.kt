package fr.gouv.cnsp.monitorfish.domain.entities.mission

import kotlinx.serialization.Serializable

@Serializable
data class Mission(
    /*
        Other fields are not required for the moment, see
        monitorenv/backend/src/main/kotlin/fr/gouv/cacem/monitorenv/domain/entities/missions/MissionEntity.kt
        for the full entity structure
     */
    val controlUnits: List<ControlUnit> = listOf()
)
