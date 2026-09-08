package fr.gouv.cnsp.monitorfish.domain.entities.favorite_vessels

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselIdentity

data class FavoriteVessels(
    val hashedEmail: String,
    val vessels: List<VesselIdentity>,
)
