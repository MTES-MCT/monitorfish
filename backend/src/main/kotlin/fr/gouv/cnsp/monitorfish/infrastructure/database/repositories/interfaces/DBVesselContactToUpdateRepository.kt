package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselContactToUpdateEntity
import org.springframework.data.repository.CrudRepository

interface DBVesselContactToUpdateRepository : CrudRepository<VesselContactToUpdateEntity, Int> {
    fun findByVesselId(vesselId: Int): VesselContactToUpdateEntity?
}
