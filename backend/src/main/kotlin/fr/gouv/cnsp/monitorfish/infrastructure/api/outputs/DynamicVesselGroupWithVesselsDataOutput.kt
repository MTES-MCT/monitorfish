package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup

data class DynamicVesselGroupWithVesselsDataOutput(
    val group: DynamicVesselGroupDataOutput,
    val vessels: List<LastPositionDataOutput>,
) {
    companion object {
        fun fromDynamicVesselGroup(group: DynamicVesselGroup, vessels: List<LastPosition>) =
            DynamicVesselGroupWithVesselsDataOutput(
                group = DynamicVesselGroupDataOutput.fromDynamicVesselGroup(group),
                vessels = vessels.map { LastPositionDataOutput.fromLastPosition(it) }
            )
    }
}
