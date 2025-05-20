package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselProfileEntity
import org.springframework.data.repository.CrudRepository

interface DBVesselProfileRepository : CrudRepository<VesselProfileEntity, String> {
    fun findByCfr(cfr: String): VesselProfileEntity
}
