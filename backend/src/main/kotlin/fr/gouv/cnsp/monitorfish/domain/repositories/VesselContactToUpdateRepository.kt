package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselContactToUpdate

interface VesselContactToUpdateRepository {
    fun findByVesselId(vesselId: Int): VesselContactToUpdate?

    fun save(vesselContactToUpdate: VesselContactToUpdate): VesselContactToUpdate
}
