package fr.gouv.cnsp.monitorfish.infrastructure.api.outputs

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.EnrichedActiveVesselWithPositions

data class SelectedVesselAndPositionsDataOutput(
    val positions: List<PositionDataOutput>,
    val vessel: SelectedVesselDataOutput?,
) {
    companion object {
        fun fromEnrichedActiveVesselWithPositions(
            enrichedActiveVesselWithPositions: EnrichedActiveVesselWithPositions,
        ): SelectedVesselAndPositionsDataOutput =
            SelectedVesselAndPositionsDataOutput(
                vessel =
                    SelectedVesselDataOutput.fromEnrichedActiveVessel(
                        enrichedActiveVessel = enrichedActiveVesselWithPositions.enrichedActiveVessel,
                    ),
                positions =
                    enrichedActiveVesselWithPositions.positions.map {
                        PositionDataOutput.fromPosition(it)
                    },
            )
    }
}
