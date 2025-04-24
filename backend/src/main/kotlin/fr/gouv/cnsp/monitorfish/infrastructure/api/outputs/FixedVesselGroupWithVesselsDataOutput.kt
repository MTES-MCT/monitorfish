package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup

data class FixedVesselGroupWithVesselsDataOutput(
    val group: FixedVesselGroupDataOutput,
    val vessels: List<LastPositionDataOutput>,
) {
    companion object {
        fun fromFixedVesselGroup(
            group: FixedVesselGroup,
            vessels: List<LastPosition>,
        ) = FixedVesselGroupWithVesselsDataOutput(
            group = FixedVesselGroupDataOutput.fromFixedVesselGroup(group),
            vessels = vessels.map { LastPositionDataOutput.fromLastPosition(it) },
        )
    }
}
