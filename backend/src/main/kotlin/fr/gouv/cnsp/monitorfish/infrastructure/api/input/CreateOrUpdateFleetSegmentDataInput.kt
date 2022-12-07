package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.CreateOrUpdateFleetSegmentFields

data class CreateOrUpdateFleetSegmentDataInput(
    var segment: String? = null,
    var segmentName: String? = null,
    var gears: List<String>? = null,
    var faoAreas: List<String>? = null,
    var targetSpecies: List<String>? = null,
    var bycatchSpecies: List<String>? = null,
    var impactRiskFactor: Double? = null,
    var year: Int? = null
) {
    fun toCreateOrUpdateFleetSegmentFields() = CreateOrUpdateFleetSegmentFields(
        segment = this.segment,
        segmentName = this.segmentName,
        gears = this.gears,
        faoAreas = this.faoAreas,
        targetSpecies = this.targetSpecies,
        bycatchSpecies = this.bycatchSpecies,
        impactRiskFactor = this.impactRiskFactor,
        year = this.year
    )
}
