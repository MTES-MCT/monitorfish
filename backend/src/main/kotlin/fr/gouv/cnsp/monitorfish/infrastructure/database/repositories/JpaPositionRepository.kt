package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPositionRepository
import jakarta.transaction.Transactional
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository
import java.time.ZoneOffset
import java.time.ZonedDateTime

@Repository
class JpaPositionRepository(private val dbPositionRepository: DBPositionRepository) : PositionRepository {

    private val logger: Logger = LoggerFactory.getLogger(JpaPositionRepository::class.java)

    override fun findAll(): List<Position> {
        return dbPositionRepository.findAll()
            .map(PositionEntity::toPosition)
    }

    override fun findVesselLastPositionsWithoutSpecifiedIdentifier(
        internalReferenceNumber: String,
        externalReferenceNumber: String,
        ircs: String,
        from: ZonedDateTime,
        to: ZonedDateTime
    ): List<Position> {
        if (internalReferenceNumber.isNotEmpty()) {
            return findVesselLastPositionsByInternalReferenceNumber(internalReferenceNumber, from, to)
        }

        if (ircs.isNotEmpty()) {
            return findVesselLastPositionsByIrcs(ircs, from, to)
        }

        if (externalReferenceNumber.isNotEmpty()) {
            return findVesselLastPositionsByExternalReferenceNumber(externalReferenceNumber, from, to)
        }

        return listOf()
    }

    @Cacheable(value = ["vessel_track"])
    override fun findVesselLastPositionsByInternalReferenceNumber(
        internalReferenceNumber: String,
        from: ZonedDateTime,
        to: ZonedDateTime
    ): List<Position> {
        return dbPositionRepository.findLastByInternalReferenceNumber(internalReferenceNumber, from, to)
            .map(PositionEntity::toPosition)
    }

    @Cacheable(value = ["vessel_track"])
    override fun findVesselLastPositionsByIrcs(
        ircs: String,
        from: ZonedDateTime,
        to: ZonedDateTime
    ): List<Position> {
        return dbPositionRepository.findLastByIrcs(ircs, from, to)
            .map(PositionEntity::toPosition)
    }

    @Cacheable(value = ["vessel_track"])
    override fun findVesselLastPositionsByExternalReferenceNumber(
        externalReferenceNumber: String,
        from: ZonedDateTime,
        to: ZonedDateTime
    ): List<Position> {
        return dbPositionRepository.findLastByExternalReferenceNumber(externalReferenceNumber, from, to)
            .map(PositionEntity::toPosition)
    }

    @Transactional
    override fun save(position: Position) {
        val positionEntity = PositionEntity.fromPosition(position)
        dbPositionRepository.save(positionEntity)
    }

    override fun findAllByMmsi(mmsi: String): List<Position> {
        return dbPositionRepository.findAllByMmsi(mmsi)
            .map(PositionEntity::toPosition)
    }

    override fun findLastPositionDate(): ZonedDateTime {
        return dbPositionRepository.findLastPositionDateTime().atZone(ZoneOffset.UTC)
    }
}
