package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LastPositionEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.jpa.repository.support.SimpleJpaRepository
import org.springframework.data.repository.CrudRepository
import java.time.Instant
import java.time.ZonedDateTime

@DynamicUpdate
interface DBLastPositionRepository : JpaRepository<LastPositionEntity, Int> {
    fun findAllByDateTimeGreaterThanEqual(dateTime: ZonedDateTime) : List<LastPositionEntity>

    @Query("select last_position_datetime_utc from last_positions order by last_position_datetime_utc desc limit 1", nativeQuery = true)
    fun findLastPositionDateTime(): Instant
}
