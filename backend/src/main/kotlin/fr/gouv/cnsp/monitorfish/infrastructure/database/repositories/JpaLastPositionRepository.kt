package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LastPositionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLastPositionRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@Repository
class JpaLastPositionRepository(private val dbLastPositionRepository: DBLastPositionRepository) : LastPositionRepository {

    @Cacheable(value = ["vessels_position"])
    override fun findAll(): List<Position> {
        val nowMinus48Hours = ZonedDateTime.now().minusHours(48)
        return dbLastPositionRepository.findAllByDateTimeGreaterThanEqual(nowMinus48Hours)
                // We NEED this non filterNotNull (even if the IDE say not so, as the SQL request may return null internalReferenceNumber)
                .filterNotNull()
                .map(LastPositionEntity::toPosition)
    }

    @Transactional
    override fun upsert(position: Position) {
        val positionEntity = LastPositionEntity.fromPosition(position)
        dbLastPositionRepository.save(positionEntity)
    }
}
