package fr.gouv.cnsp.monitorfish.infrastructure.api.input

import fr.gouv.cnsp.monitorfish.domain.use_cases.dtos.UpdateFleetSegmentFields

data class UpdateFleetSegmentDataInput(
        var segment: String? = null,
        var segmentName: String? = null,
        var gears: List<String>? = null,
        var faoAreas: List<String>? = null,
        var targetSpecies: List<String>? = null,
        var bycatchSpecies: List<String>? = null,
        var impactRiskFactor: Double? = null
) {
    fun toUpdateFleetSegmentFields() = UpdateFleetSegmentFields(
            segment = this.segment,
            segmentName = this.segmentName,
            gears = this.gears,
            faoAreas = this.faoAreas,
            targetSpecies = this.targetSpecies,
            bycatchSpecies = this.bycatchSpecies,
            impactRiskFactor = this.impactRiskFactor)
}