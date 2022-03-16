package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import java.time.ZonedDateTime

interface LastPositionRepository {
    fun findAll(): List<LastPosition>
    fun findAllInLast48Hours(): List<LastPosition>
    fun findAllWithBeaconMalfunctionBeforeLast48Hours(): List<LastPosition>
    fun findLastPositionDate(): ZonedDateTime
    // For test purpose
    fun deleteAll()
}