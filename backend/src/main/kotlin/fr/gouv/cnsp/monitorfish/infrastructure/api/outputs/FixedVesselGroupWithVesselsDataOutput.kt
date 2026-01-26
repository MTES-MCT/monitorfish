package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup

data class FixedVesselGroupWithVesselsDataOutput(
    val group: FixedVesselGroupDataOutput,
    val vessels: List<ActiveVesselBaseDataOutput>,
) {
    companion object {
        fun fromFixedVesselGroup(
            group: FixedVesselGroup,
            vessels: List<Pair<Int, EnrichedActiveVessel>>,
        ) = FixedVesselGroupWithVesselsDataOutput(
            group = FixedVesselGroupDataOutput.fromFixedVesselGroup(group),
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
