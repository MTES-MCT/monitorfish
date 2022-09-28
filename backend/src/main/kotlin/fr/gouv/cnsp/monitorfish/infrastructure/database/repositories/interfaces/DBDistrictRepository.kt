package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.DistrictEntity
import org.springframework.data.repository.CrudRepository

interface DBDistrictRepository : CrudRepository<DistrictEntity, String> {
    fun findByDistrictCodeEquals(code: String): DistrictEntity
}
