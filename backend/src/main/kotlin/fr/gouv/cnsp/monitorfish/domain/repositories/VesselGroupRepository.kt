package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase

interface VesselGroupRepository {
    fun findAllByUser(user: String): List<VesselGroupBase>

    fun findById(id: Int): VesselGroupBase

    fun save(vesselGroup: DynamicVesselGroup): DynamicVesselGroup

    fun save(vesselGroup: FixedVesselGroup): FixedVesselGroup

    fun delete(id: Int)
}
