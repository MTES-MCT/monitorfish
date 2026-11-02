package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselRiskElementEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.VesselRiskElementId
import org.springframework.data.repository.CrudRepository

interface DBVesselRiskElementRepository : CrudRepository<VesselRiskElementEntity, VesselRiskElementId> {
    fun findAllByIdCfr(cfr: String): List<VesselRiskElementEntity>
}
