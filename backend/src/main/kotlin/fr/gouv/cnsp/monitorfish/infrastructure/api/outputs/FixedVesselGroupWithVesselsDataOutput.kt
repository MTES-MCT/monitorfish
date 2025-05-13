package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselWithReferentialData
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup

data class FixedVesselGroupWithVesselsDataOutput(
    val group: FixedVesselGroupDataOutput,
    val vessels: List<ActiveVesselBaseDataOutput>,
) {
    companion object {
        fun fromFixedVesselGroup(
            group: FixedVesselGroup,
            vessels: List<ActiveVesselWithReferentialData>,
        ) = FixedVesselGroupWithVesselsDataOutput(
            group = FixedVesselGroupDataOutput.fromFixedVesselGroup(group),
            vessels =
                vessels.map {
                    ActiveVesselBaseDataOutput.fromActiveVesselWithReferentialData(it)
                },
        )
    }
}
