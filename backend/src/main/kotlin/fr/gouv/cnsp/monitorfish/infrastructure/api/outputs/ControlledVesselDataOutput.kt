package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import com.fasterxml.jackson.annotation.JsonUnwrapped
import fr.gouv.cnsp.monitorfish.domain.entities.reporting.Reporting
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.Vessel
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.PriorityVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase

data class ControlledVesselDataOutput(
    @JsonUnwrapped
    val controlledVessel: VesselIdentityDataOutput,
    // Could be either `DynamicVesselGroupDataOutput` or `FixedVesselGroupDataOutput`
    val groups: List<Any> = listOf(),
    val tripReportings: List<ReportingDataOutput>,
) {
    companion object {
        fun fromVessel(
            vessel: Vessel,
            vesselGroups: List<VesselGroupBase>,
            tripReportings: List<Reporting>,
        ): ControlledVesselDataOutput =
            ControlledVesselDataOutput(
                controlledVessel = VesselIdentityDataOutput.fromVessel(vessel),
                groups =
                    vesselGroups.map {
                        when (it) {
                            is DynamicVesselGroup ->
                                DynamicVesselGroupDataOutput.fromDynamicVesselGroup(
                                    vesselGroup = it,
                                )
                            is FixedVesselGroup ->
                                FixedVesselGroupDataOutput.fromFixedVesselGroup(
                                    vesselGroup = it,
                                )
                            is PriorityVesselGroup ->
                                PriorityVesselGroupDataOutput.fromPriorityVesselGroup(
                                    vesselGroup = it,
                                )
                        }
                    },
                tripReportings =
                    tripReportings.map {
                        ReportingDataOutput.fromReporting(
                            reporting = it,
                            controlUnit = null,
                            useThreatHierarchyForForm = false,
                        )
                    },
            )
    }
}
