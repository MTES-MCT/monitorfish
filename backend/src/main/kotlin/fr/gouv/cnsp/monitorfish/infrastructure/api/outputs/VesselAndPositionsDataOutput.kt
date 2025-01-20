package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselInformation

data class VesselAndPositionsDataOutput(
    val positions: List<PositionDataOutput>,
    val vessel: VesselDataOutput?,
) {
    companion object {
        fun fromVesselInformation(vesselInformation: VesselInformation): VesselAndPositionsDataOutput =
            VesselAndPositionsDataOutput(
                vessel =
                    VesselDataOutput.fromVesselAndRelatedDatas(
                        vessel = vesselInformation.vessel,
                        beacon = vesselInformation.beacon,
                        vesselRiskFactor = vesselInformation.vesselRiskFactor,
                        producerOrganizationMembership = vesselInformation.producerOrganization,
                    ),
                positions =
                    vesselInformation.positions.map {
                        PositionDataOutput.fromPosition(it)
                    },
            )
    }
}
