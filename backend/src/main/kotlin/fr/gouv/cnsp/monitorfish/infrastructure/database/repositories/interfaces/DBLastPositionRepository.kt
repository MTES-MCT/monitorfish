package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces

import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LastPositionEntity
import org.hibernate.annotations.DynamicUpdate
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.Instant
import java.time.ZonedDateTime

@DynamicUpdate
interface DBLastPositionRepository : JpaRepository<LastPositionEntity, Int> {
    fun findAllByDateTimeLessThanEqualAndBeaconMalfunctionIdNotNull(dateTime: ZonedDateTime) : List<LastPositionEntity>

    fun findAllByDateTimeGreaterThanEqual(dateTime: ZonedDateTime) : List<LastPositionEntity>

    @Query("select last_position_datetime_utc from last_positions where last_position_datetime_utc < now() order by last_position_datetime_utc desc limit 1", nativeQuery = true)
    fun findLastPositionDateTime(): Instant
}
