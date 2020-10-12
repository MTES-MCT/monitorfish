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

    override fun findLastDistinctPositions(): List<Position> {
        return dbPositionRepository.findLastDistinctPositions()
                .map(PositionEntity::toPosition)
    }

    override fun save(position: Position) {
        val positionEntity = PositionEntity.fromPosition(position)
        dbPositionRepository.save(positionEntity)
    }

    override fun findAllByMMSI(MMSI: String): List<Position> {
        return dbPositionRepository.findAllByMMSI(MMSI)
                .map(PositionEntity::toPosition)
    }
}
