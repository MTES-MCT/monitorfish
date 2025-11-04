package fr.gouv.cnsp.monitorfish.domain.entities.alerts

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import java.time.ZonedDateTime

data class PositionAlertSpecification(
    val id: Int? = null,
    val name: String,
    val type: String = AlertType.POSITION_ALERT.name,
    val description: String,
    val isUserDefined: Boolean,
    val natinfCode: Int,
    val isActivated: Boolean = false,
    val isInError: Boolean = false,
    val isDeleted: Boolean = false,
    val hasAutomaticArchiving: Boolean = false,
    val errorReason: String? = null,
    val validityStartDatetimeUtc: ZonedDateTime? = null,
    val validityEndDatetimeUtc: ZonedDateTime? = null,
    val repeatEachYear: Boolean,
    val trackAnalysisDepth: Double,
    val onlyFishingPositions: Boolean,
    val gears: List<GearSpecification> = listOf(),
    val species: List<SpeciesSpecification> = listOf(),
    val speciesCatchAreas: List<String> = listOf(),
    val administrativeAreas: List<AdministrativeAreaSpecification> = listOf(),
    val regulatoryAreas: List<RegulatoryAreaSpecification> = listOf(),
    val minDepth: Double? = null,
    val flagStatesIso2: List<String> = listOf(),
    val vesselIds: List<Int> = listOf(),
    val vessels: List<Vessel> = listOf(),
    val districtCodes: List<String> = listOf(),
    val producerOrganizations: List<String> = listOf(),
    val createdBy: String? = null,
    val createdAtUtc: ZonedDateTime? = null,
)

data class GearSpecification(
    val gear: String,
    val minMesh: Double?,
    val maxMesh: Double?,
    val meshType: GearMeshSizeEqualityComparator?,
)

data class SpeciesSpecification(
    val species: String,
    val minWeight: Double?,
)

data class RegulatoryAreaSpecification(
    val lawType: String?,
    val topic: String?,
    val zone: String?,
)

data class AdministrativeAreaSpecification(
    val areas: List<String>,
    val areaType: AdministrativeAreaType,
)

enum class AdministrativeAreaType {
    FAO_AREA,
    EEZ_AREA,
    NEAFC_AREA,
    DISTANCE_TO_SHORE,
}

enum class GearMeshSizeEqualityComparator {
    EQUAL,
    BETWEEN,
    GREATER_THAN,
    LOWER_THAN,
    LESS_THAN_OR_EQUAL_TO,
    GREATER_THAN_OR_EQUAL_TO,
}
