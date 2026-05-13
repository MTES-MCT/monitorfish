package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LastPositionAisEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DBLastPositionAisRepository : JpaRepository<LastPositionAisEntity, Long> {
    fun findByIsAtPort(isAtPort: Boolean): List<LastPositionAisEntity>

    @Query(value = "SELECT * FROM last_positions_ais WHERE cfr IS NULL", nativeQuery = true)
    fun findByCfrIsNull(): List<LastPositionAisEntity>

    @Query(
        value = "SELECT * FROM last_positions_ais WHERE cfr IS NULL AND is_at_port = :isAtPort",
        nativeQuery = true,
    )
    fun findByCfrIsNullAndIsAtPort(isAtPort: Boolean): List<LastPositionAisEntity>
}
