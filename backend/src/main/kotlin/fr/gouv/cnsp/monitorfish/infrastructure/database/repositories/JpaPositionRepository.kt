package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.Position
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPositionRepository
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository

@Repository
class JpaPositionRepository(private val dbPositionRepository: DBPositionRepository) : PositionRepository {

    private val logger: Logger = LoggerFactory.getLogger(JpaPositionRepository::class.java)

    override fun findAll(): List<Position> {
        return dbPositionRepository.findAll()
                .map(PositionEntity::toPosition)
    }

    @Cacheable(value = ["vessel_track"])
    override fun findVesselLastPositions(internalReferenceNumber: String, externalReferenceNumber: String, ircs: String): List<Position> {
        if(internalReferenceNumber.isNotEmpty()) {
            return dbPositionRepository.findLastByInternalReferenceNumber(internalReferenceNumber)
                    .map(PositionEntity::toPosition)
        }

        if(externalReferenceNumber.isNotEmpty()) {
            return dbPositionRepository.findLastByExternalReferenceNumber(externalReferenceNumber)
                    .map(PositionEntity::toPosition)
        }

        if(ircs.isNotEmpty()) {
            return dbPositionRepository.findLastByIrcs(ircs)
                    .map(PositionEntity::toPosition)
        }

        return listOf()
    }


    override fun save(position: Position) {
        val positionEntity = PositionEntity.fromPosition(position)
        dbPositionRepository.save(positionEntity)
    }

    override fun findAllByMmsi(mmsi: String): List<Position> {
        return dbPositionRepository.findAllByMmsi(mmsi)
                .map(PositionEntity::toPosition)
    }
}
