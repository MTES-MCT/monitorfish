package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LastPositionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLastPositionRepository
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository
import java.time.ZonedDateTime

@Repository
class JpaLastPositionRepository(private val dbLastPositionRepository: DBLastPositionRepository,
                                private val mapper: ObjectMapper) : LastPositionRepository {

    @Cacheable(value = ["vessels_position"])
    override fun findAll(): List<LastPosition> {
        val nowMinus48Hours = ZonedDateTime.now().minusHours(48)
        return dbLastPositionRepository.findAllByDateTimeGreaterThanEqual(nowMinus48Hours)
                // We NEED this non filterNotNull (even if the IDE say not so, as the SQL request may return null internalReferenceNumber)
                .filterNotNull()
                .map {
                    it.toLastPosition(mapper)
                }
    }
}
