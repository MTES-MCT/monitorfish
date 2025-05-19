package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselWithReferentialData
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup

data class DynamicVesselGroupWithVesselsDataOutput(
    val group: DynamicVesselGroupDataOutput,
    val vessels: List<ActiveVesselBaseDataOutput>,
) {
    companion object {
        fun fromDynamicVesselGroup(
            group: DynamicVesselGroup,
            vessels: List<ActiveVesselWithReferentialData>,
        ) = DynamicVesselGroupWithVesselsDataOutput(
            group = DynamicVesselGroupDataOutput.fromDynamicVesselGroup(group),
            vessels =
                vessels.mapIndexed { index, it ->
                    ActiveVesselBaseDataOutput.fromActiveVesselWithReferentialData(
                        activeVesselWithReferentialData = it,
                        index = index,
                    )
                },
        )
    }
}
