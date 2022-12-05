package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselWithData

data class VesselAndPositionsDataOutput(
    val positions: List<PositionDataOutput>,
    val vessel: VesselDataOutput?
) {
    companion object {
        fun fromVesselWithData(vesselWithData: VesselWithData): VesselAndPositionsDataOutput {
            return VesselAndPositionsDataOutput(
                vessel = VesselDataOutput.fromVesselAndRiskFactor(
                    vesselWithData.vessel,
                    vesselWithData.vesselRiskFactor
                ),
                positions = vesselWithData.positions.map {
                    PositionDataOutput.fromPosition(it)
                }
            )
        }
    }
}
