package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionEntity
import org.springframework.stereotype.Repository

@Repository
class JpaPositionsRepository(private val dbPositionRepository: DBPositionRepository) : PositionsRepository {
    override fun findAll(): List<Position> {
        return dbPositionRepository.findAll()
                .map(PositionEntity::toPosition)
    }
}
