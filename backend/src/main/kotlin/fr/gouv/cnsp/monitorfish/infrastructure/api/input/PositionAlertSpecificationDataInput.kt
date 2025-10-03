package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.entities.alerts.*
import java.time.ZonedDateTime

data class PositionAlertSpecificationDataInput(
    val name: String,
    val type: String,
    val description: String,
    val natinfCode: Int,
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
    val districtCodes: List<String> = listOf(),
    val producerOrganizations: List<String> = listOf(),
) {
    fun toPositionAlertSpecification() =
        PositionAlertSpecification(
            name = this.name,
            type = this.type,
            description = this.description,
            isUserDefined = true,
            natinfCode = this.natinfCode,
            validityStartDatetimeUtc = this.validityStartDatetimeUtc,
            validityEndDatetimeUtc = this.validityEndDatetimeUtc,
            repeatEachYear = this.repeatEachYear,
            trackAnalysisDepth = this.trackAnalysisDepth,
            onlyFishingPositions = this.onlyFishingPositions,
            gears = this.gears,
            species = this.species,
            speciesCatchAreas = this.speciesCatchAreas,
            administrativeAreas = this.administrativeAreas,
            regulatoryAreas = this.regulatoryAreas,
            minDepth = this.minDepth,
            flagStatesIso2 = this.flagStatesIso2,
            vesselIds = this.vesselIds,
            districtCodes = this.districtCodes,
            producerOrganizations = this.producerOrganizations,
        )
}
