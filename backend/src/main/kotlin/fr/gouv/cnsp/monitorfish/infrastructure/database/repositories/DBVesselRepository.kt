package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselEntity
import org.springframework.data.repository.CrudRepository

interface DBVesselRepository : CrudRepository<VesselEntity, Long> {
    fun findByInternalReferenceNumber(internalReferenceNumber: String): VesselEntity
}
