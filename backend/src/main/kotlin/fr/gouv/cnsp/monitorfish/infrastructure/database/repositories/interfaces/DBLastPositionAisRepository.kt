package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LastPositionAisEntity
import org.springframework.data.jpa.repository.JpaRepository

interface DBLastPositionAisRepository : JpaRepository<LastPositionAisEntity, Long> {
    fun findByIsAtPort(isAtPort: Boolean): List<LastPositionAisEntity>
}
