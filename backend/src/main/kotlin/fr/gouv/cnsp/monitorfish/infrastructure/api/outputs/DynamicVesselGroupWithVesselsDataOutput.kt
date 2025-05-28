package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup

data class DynamicVesselGroupWithVesselsDataOutput(
    val group: DynamicVesselGroupDataOutput,
    val vessels: List<ActiveVesselBaseDataOutput>,
) {
    companion object {
        fun fromDynamicVesselGroup(
            group: DynamicVesselGroup,
            vessels: List<EnrichedActiveVessel>,
        ) = DynamicVesselGroupWithVesselsDataOutput(
            group = DynamicVesselGroupDataOutput.fromDynamicVesselGroup(group),
            vessels =
                vessels.mapIndexed { index, it ->
                    ActiveVesselBaseDataOutput.fromEnrichedActiveVessel(
                        enrichedActiveVessel = it,
                        index = index,
                    )
                },
        )
    }
}
