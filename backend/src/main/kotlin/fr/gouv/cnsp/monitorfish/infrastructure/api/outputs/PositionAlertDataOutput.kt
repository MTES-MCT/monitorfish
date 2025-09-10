package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.*
import java.time.ZonedDateTime

data class PositionAlertDataOutput(
    val id: Int? = null,
    val name: String,
    val description: String,
    val isUserDefined: Boolean,
    val natinfCode: Int,
    val isActivated: Boolean = true,
    val isInError: Boolean = false,
    val errorReason: String? = null,
    val validityStartDatetimeUtc: ZonedDateTime? = null,
    val validityEndDatetimeUtc: ZonedDateTime? = null,
    val repeatEachYear: Boolean,
    val trackAnalysisDepth: Double,
    val onlyFishingPositions: Boolean,
    val gears: List<GearSpecificationDataOutput> = listOf(),
    val species: List<SpeciesSpecificationDataOutput> = listOf(),
    val speciesCatchAreas: List<String> = listOf(),
    val administrativeAreas: List<AdministrativeAreaSpecificationDataOutput> = listOf(),
    val regulatoryAreas: List<RegulatoryAreaSpecificationDataOutput> = listOf(),
    val minDepth: Double? = null,
    val flagStatesIso2: List<String>? = listOf(),
    val vesselIds: List<Int>? = listOf(),
    val districtCodes: List<String>? = listOf(),
    val producerOrganizations: List<String> = listOf(),
    val createdBy: String,
    val createdAtUtc: ZonedDateTime,
) {
    companion object {
        fun fromPositionAlert(positionAlert: PositionAlert) =
            PositionAlertDataOutput(
                id = positionAlert.id,
                name = positionAlert.name,
                description = positionAlert.description,
                isUserDefined = positionAlert.isUserDefined,
                natinfCode = positionAlert.natinfCode,
                isActivated = positionAlert.isActivated,
                isInError = positionAlert.isInError,
                errorReason = positionAlert.errorReason,
                validityStartDatetimeUtc = positionAlert.validityStartDatetimeUtc,
                validityEndDatetimeUtc = positionAlert.validityEndDatetimeUtc,
                repeatEachYear = positionAlert.repeatEachYear,
                trackAnalysisDepth = positionAlert.trackAnalysisDepth,
                onlyFishingPositions = positionAlert.onlyFishingPositions,
                gears = positionAlert.gears.map { GearSpecificationDataOutput.fromGearSpecification(it) },
                species = positionAlert.species.map { SpeciesSpecificationDataOutput.fromSpeciesSpecification(it) },
                speciesCatchAreas = positionAlert.speciesCatchAreas,
                administrativeAreas =
                    positionAlert.administrativeAreas.map {
                        AdministrativeAreaSpecificationDataOutput.fromAdministrativeAreaSpecification(it)
                    },
                regulatoryAreas =
                    positionAlert.regulatoryAreas.map {
                        RegulatoryAreaSpecificationDataOutput.fromRegulatoryAreaSpecification(it)
                    },
                minDepth = positionAlert.minDepth,
                flagStatesIso2 = positionAlert.flagStatesIso2,
                vesselIds = positionAlert.vesselIds,
                districtCodes = positionAlert.districtCodes,
                producerOrganizations = positionAlert.producerOrganizations,
                createdBy = positionAlert.createdBy,
                createdAtUtc = positionAlert.createdAtUtc,
            )
    }
}

data class GearSpecificationDataOutput(
    val gear: String,
    val minMesh: Double?,
    val maxMesh: Double?,
) {
    companion object {
        fun fromGearSpecification(gearSpecification: GearSpecification) =
            GearSpecificationDataOutput(
                gear = gearSpecification.gear,
                minMesh = gearSpecification.minMesh,
                maxMesh = gearSpecification.maxMesh,
            )
    }
}

data class SpeciesSpecificationDataOutput(
    val species: String,
    val minWeight: Double?,
) {
    companion object {
        fun fromSpeciesSpecification(speciesSpecification: SpeciesSpecification) =
            SpeciesSpecificationDataOutput(
                species = speciesSpecification.species,
                minWeight = speciesSpecification.minWeight,
            )
    }
}

data class RegulatoryAreaSpecificationDataOutput(
    val lawType: String?,
    val topic: String?,
    val zone: String?,
) {
    companion object {
        fun fromRegulatoryAreaSpecification(regulatoryAreaSpecification: RegulatoryAreaSpecification) =
            RegulatoryAreaSpecificationDataOutput(
                lawType = regulatoryAreaSpecification.lawType,
                topic = regulatoryAreaSpecification.topic,
                zone = regulatoryAreaSpecification.zone,
            )
    }
}

data class AdministrativeAreaSpecificationDataOutput(
    val areas: List<String>,
    val areaType: AdministrativeAreaType,
) {
    companion object {
        fun fromAdministrativeAreaSpecification(administrativeAreaSpecification: AdministrativeAreaSpecification) =
            AdministrativeAreaSpecificationDataOutput(
                areas = administrativeAreaSpecification.areas,
                areaType = administrativeAreaSpecification.areaType,
            )
    }
}
