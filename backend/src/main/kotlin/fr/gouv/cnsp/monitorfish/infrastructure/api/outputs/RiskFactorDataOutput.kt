package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.CurrentSegment

data class RiskFactorDataOutput(
        val gearOnboard: List<GearLastPositionDataOutput>? = null,
        val segments: List<String>? = listOf(),
        val speciesOnboard: List<SpeciesLastPositionDataOutput>? = null,
        val controlPriorityLevel: Double? = null
) {
    companion object {
        fun fromCurrentSegment(currentSegment: CurrentSegment?) = RiskFactorDataOutput(
                gearOnboard = currentSegment?.gearOnboard?.map { GearLastPositionDataOutput.fromGearLastPosition(it) },
                segments = currentSegment?.segments,
                speciesOnboard = currentSegment?.speciesOnboard?.map { SpeciesLastPositionDataOutput.fromSpeciesLastPosition(it) },
                controlPriorityLevel = currentSegment?.controlPriorityLevel
        )
    }
}
