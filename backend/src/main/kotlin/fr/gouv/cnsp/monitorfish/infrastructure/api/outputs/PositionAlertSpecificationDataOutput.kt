package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.*
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.utils.InfractionHierarchyBuilder
import java.time.ZonedDateTime

data class PositionAlertSpecificationDataOutput(
    val id: Int? = null,
    val name: String,
    val type: String,
    val description: String,
    val isUserDefined: Boolean,
    val threatHierarchy: ThreatHierarchyDataOutput? = null,
    val natinf: Int,
    val threat: String,
    val threatCharacterization: String,
    val isActivated: Boolean = true,
    val isInError: Boolean = false,
    val hasAutomaticArchiving: Boolean = false,
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
    val flagStatesIso2: List<String> = listOf(),
    val vesselIds: List<Int> = listOf(),
    val vessels: List<VesselIdentityDataOutput> = listOf(),
    val districtCodes: List<String> = listOf(),
    val producerOrganizations: List<String> = listOf(),
    val createdBy: String,
    val createdAtUtc: ZonedDateTime,
) {
    companion object {
        fun fromPositionAlertSpecification(
            positionAlertSpecification: PositionAlertSpecification,
            useThreatHierarchyForForm: Boolean = true,
        ): PositionAlertSpecificationDataOutput {
            val threatHierarchy =
                if (useThreatHierarchyForForm) {
                    InfractionHierarchyBuilder
                        .buildThreatHierarchy(
                            items = listOf(positionAlertSpecification),
                            threatExtractor = { it.threat },
                            characterizationExtractor = { it.threatCharacterization },
                            natinfCodeExtractor = { it.natinf },
                            infractionNameExtractor = { "" },
                        ).single()
                } else {
                    null
                }

            return PositionAlertSpecificationDataOutput(
                id = positionAlertSpecification.id,
                name = positionAlertSpecification.name,
                type = positionAlertSpecification.type,
                description = positionAlertSpecification.description,
                isUserDefined = positionAlertSpecification.isUserDefined,
                threatHierarchy = threatHierarchy,
                natinf = positionAlertSpecification.natinf,
                threat = positionAlertSpecification.threat,
                threatCharacterization = positionAlertSpecification.threatCharacterization,
                isActivated = positionAlertSpecification.isActivated,
                hasAutomaticArchiving = positionAlertSpecification.hasAutomaticArchiving,
                isInError = positionAlertSpecification.isInError,
                errorReason = positionAlertSpecification.errorReason,
                validityStartDatetimeUtc = positionAlertSpecification.validityStartDatetimeUtc,
                validityEndDatetimeUtc = positionAlertSpecification.validityEndDatetimeUtc,
                repeatEachYear = positionAlertSpecification.repeatEachYear,
                trackAnalysisDepth = positionAlertSpecification.trackAnalysisDepth,
                onlyFishingPositions = positionAlertSpecification.onlyFishingPositions,
                gears = positionAlertSpecification.gears.map { GearSpecificationDataOutput.fromGearSpecification(it) },
                species =
                    positionAlertSpecification.species.map {
                        SpeciesSpecificationDataOutput
                            .fromSpeciesSpecification(
                                it,
                            )
                    },
                speciesCatchAreas = positionAlertSpecification.speciesCatchAreas,
                administrativeAreas =
                    positionAlertSpecification.administrativeAreas.map {
                        AdministrativeAreaSpecificationDataOutput.fromAdministrativeAreaSpecification(it)
                    },
                regulatoryAreas =
                    positionAlertSpecification.regulatoryAreas.map {
                        RegulatoryAreaSpecificationDataOutput.fromRegulatoryAreaSpecification(it)
                    },
                minDepth = positionAlertSpecification.minDepth,
                flagStatesIso2 = positionAlertSpecification.flagStatesIso2,
                vesselIds = positionAlertSpecification.vesselIds,
                vessels = positionAlertSpecification.vessels.map { VesselIdentityDataOutput.fromVessel(it) },
                districtCodes = positionAlertSpecification.districtCodes,
                producerOrganizations = positionAlertSpecification.producerOrganizations,
                createdBy = positionAlertSpecification.createdBy!!,
                createdAtUtc = positionAlertSpecification.createdAtUtc!!,
            )
        }
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
