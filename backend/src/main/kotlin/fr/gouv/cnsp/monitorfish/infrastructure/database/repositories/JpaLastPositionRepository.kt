package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.LastPositionEntity
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class JpaLastPositionRepository(@Autowired
                            private val dbLastPositionRepository: DBLastPositionRepository) : LastPositionRepository {

    @Cacheable(value = ["vessels_position"])
    override fun findAll(): List<Position> {
        return dbLastPositionRepository.findAll()
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
