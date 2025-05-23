package fr.gouv.cnsp.monitorfish.domain.entities.vessel

import fr.gouv.cnsp.monitorfish.domain.entities.position.Position

data class EnrichedActiveVesselWithPositions(
    val enrichedActiveVessel: EnrichedActiveVessel,
    val positions: List<Position>,
)
