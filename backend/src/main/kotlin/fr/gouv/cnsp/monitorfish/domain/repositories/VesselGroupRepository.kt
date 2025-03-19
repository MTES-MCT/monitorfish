package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroup

interface VesselGroupRepository {
    fun findAllByUser(user: String): List<VesselGroup>

    fun save(vesselGroup: VesselGroup): VesselGroup

    fun delete(id: Int)
}
