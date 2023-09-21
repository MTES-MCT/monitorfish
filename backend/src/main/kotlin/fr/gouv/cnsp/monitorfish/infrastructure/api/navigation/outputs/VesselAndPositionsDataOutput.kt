package fr.gouv.cnsp.monitorfish.infrastructure.api.navigation.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselInformation
import fr.gouv.cnsp.monitorfish.infrastructure.api.outputs.PositionDataOutput

data class VesselAndPositionsDataOutput(
    val positions: List<PositionDataOutput>,
    val vessel: VesselDataOutput?,
) {
    companion object {
        fun fromVesselWithData(vesselInformation: VesselInformation): VesselAndPositionsDataOutput {
            return VesselAndPositionsDataOutput(
                vessel = VesselDataOutput.fromVessel(
                    vesselInformation.vessel
                ),
                positions = vesselInformation.positions.map {
                    PositionDataOutput.fromPosition(it)
                },
            )
        }
    }
}
