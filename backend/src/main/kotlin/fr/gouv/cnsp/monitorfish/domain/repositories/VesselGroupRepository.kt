package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.authorization.CnspService
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.DynamicVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.FixedVesselGroup
import fr.gouv.cnsp.monitorfish.domain.entities.vessel_group.VesselGroupBase

interface VesselGroupRepository {
    fun findAllByUserAndSharing(
        user: String,
        service: CnspService?,
    ): List<VesselGroupBase>

    fun findById(id: Int): VesselGroupBase

    fun upsert(vesselGroup: DynamicVesselGroup): DynamicVesselGroup

    fun upsert(vesselGroup: FixedVesselGroup): FixedVesselGroup

    fun delete(id: Int)
}
