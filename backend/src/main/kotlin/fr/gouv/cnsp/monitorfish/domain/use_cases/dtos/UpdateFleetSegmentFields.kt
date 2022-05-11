package fr.gouv.cnsp.monitorfish.domain.use_cases.dtos

import fr.gouv.cnsp.monitorfish.infrastructure.api.input.UpdateFleetSegmentDataInput

data class UpdateFleetSegmentFields(
        var segment: String? = null,
        var segmentName: String? = null,
        var gears: List<String>? = null,
        var faoAreas: List<String>? = null,
        var targetSpecies: List<String>? = null,
        var bycatchSpecies: List<String>? = null,
        var impactRiskFactor: Double? = null
) {
    companion object {
        fun fromUpdateFleetSegmentDataInput(updateFleetSegmentDataInput: UpdateFleetSegmentDataInput) = UpdateFleetSegmentFields(
                segment = updateFleetSegmentDataInput.segment,
                segmentName = updateFleetSegmentDataInput.segmentName,
                gears = updateFleetSegmentDataInput.gears,
                faoAreas = updateFleetSegmentDataInput.faoAreas,
                targetSpecies = updateFleetSegmentDataInput.targetSpecies,
                bycatchSpecies = updateFleetSegmentDataInput.bycatchSpecies,
                impactRiskFactor = updateFleetSegmentDataInput.impactRiskFactor,
        )
    }
}