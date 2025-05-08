package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.risk_factor.VesselRiskFactor
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselType
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.ActiveVesselWithReferentialData
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup

data class DynamicVesselGroupWithVesselsDataOutput(
    val group: DynamicVesselGroupDataOutput,
    val vessels: List<ActiveVesselBaseDataOutput>,
) {
    companion object {
        fun fromDynamicVesselGroup(
            group: DynamicVesselGroup,
            vessels: List<LastPosition>,
        ) = DynamicVesselGroupWithVesselsDataOutput(
            group = DynamicVesselGroupDataOutput.fromDynamicVesselGroup(group),
            vessels =
                vessels.map {
                    ActiveVesselBaseDataOutput.fromActiveVesselWithReferentialData(
                        // TODO
                        ActiveVesselWithReferentialData(
                            lastPosition = it,
                            activeVesselType = ActiveVesselType.POSITION_ACTIVITY,
                            vesselGroups = listOf(),
                            vesselProfile = null,
                            vessel = null,
                            producerOrganizationMembership = null,
                            riskFactor = VesselRiskFactor(),
                        ),
                    )
                },
        )
    }
}
