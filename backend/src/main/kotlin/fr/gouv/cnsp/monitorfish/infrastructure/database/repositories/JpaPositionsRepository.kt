package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionsRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository
import kotlin.time.measureTimedValue

@Repository
class JpaPositionsRepository(@Autowired
                             private val dbPositionRepository: DBPositionRepository) : PositionsRepository {

    private val logger: Logger = LoggerFactory.getLogger(JpaPositionsRepository::class.java)

    override fun findAll(): List<Position> {
        return dbPositionRepository.findAll()
                .map(PositionEntity::toPosition)
    }

    @Suppress("UselessCallOnCollection")
    @kotlin.time.ExperimentalTime
    @Cacheable(value = ["vessels_position"])
    override fun findAllLastDistinctPositions(): List<Position> {
        val (internalReferenceNumberPositions, internalReferenceNumberPositionsElapsed) = measureTimedValue {
            dbPositionRepository.findLastDistinctInternalReferenceNumbers()
        }
        logger.info("findLastDistinctInternalReferenceNumberPositions SQL query took ${internalReferenceNumberPositionsElapsed.inSeconds} seconds to execute")

        val (externalReferenceNumberPositions, externalReferenceNumberPositionsElapsed) = measureTimedValue {
            dbPositionRepository.findLastDistinctExternalReferenceNumberByInternalReferenceNumberIsNull()
        }
        logger.info("findLastDistinctInternalReferenceNumberPositions SQL query took ${externalReferenceNumberPositionsElapsed.inSeconds} seconds to execute")

        return (internalReferenceNumberPositions + externalReferenceNumberPositions)
                // We NEED this non filterNotNull (even if the IDE say not so, as the SQL request may return null internalReferenceNumber)
                .filterNotNull()
                .map {
                    it.toPosition()
                }
    }

    @Cacheable(value = ["vessel_track"])
    override fun findVesselLastPositions(internalReferenceNumber: String): List<Position> {
        return dbPositionRepository.findLastByInternalReferenceNumber(internalReferenceNumber)
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
