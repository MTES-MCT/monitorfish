package fr.gouv.cnsp.monitorfish.domain.use_cases.vessel_groups.dtos

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase

data class VesselGroupWithVessels(
    val group: VesselGroupBase,
    val vessels: List<LastPosition>,
)
