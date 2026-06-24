package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.PriorityVesselGroup

data class PriorityVesselGroupWithVesselsDataOutput(
    val group: PriorityVesselGroupDataOutput,
    val vessels: List<ActiveVesselBaseDataOutput>,
) {
    companion object {
        fun fromPriorityVesselGroup(
            group: PriorityVesselGroup,
            vessels: List<Pair<Int, EnrichedActiveVessel>>,
        ) = PriorityVesselGroupWithVesselsDataOutput(
            group = PriorityVesselGroupDataOutput.fromPriorityVesselGroup(group),
            vessels =
                vessels.map {
                    ActiveVesselBaseDataOutput.fromEnrichedActiveVessel(
                        enrichedActiveVessel = it.second,
                        index = it.first,
                    )
                },
        )
    }
}
