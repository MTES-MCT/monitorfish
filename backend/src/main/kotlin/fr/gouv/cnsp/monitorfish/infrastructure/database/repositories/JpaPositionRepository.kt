package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.repositories.PositionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.cache.CacheName
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.PositionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBPositionRepository
import jakarta.transaction.Transactional
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.cache.annotation.Cacheable
import org.springframework.stereotype.Repository
import java.time.ZoneOffset
import java.time.ZonedDateTime

/**
 * Truncates the track window to the minute — the cache TTL — so that two consecutive polls, whose
 * `from` and `to` are derived from `ZonedDateTime.now()`, share a key instead of each missing.
 * Without it the key is unique on every call and the cache only ever accumulates entries.
 */
private const val TRACK_WINDOW_CACHE_KEY =
    "{#root.args[0], " +
        "#root.args[1].truncatedTo(T(java.time.temporal.ChronoUnit).MINUTES), " +
        "#root.args[2].truncatedTo(T(java.time.temporal.ChronoUnit).MINUTES)}"

@Repository
class JpaPositionRepository(
    private val dbPositionRepository: DBPositionRepository,
) : PositionRepository {
    private val logger: Logger = LoggerFactory.getLogger(JpaPositionRepository::class.java)

    override fun findAll(): List<Position> =
        dbPositionRepository
            .findAll()
            .map(PositionEntity::toPosition)

    override fun findVesselLastPositionsWithoutSpecifiedIdentifier(
        internalReferenceNumber: String,
        externalReferenceNumber: String,
        ircs: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
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

    @Cacheable(value = [CacheName.VESSEL_TRACK], key = TRACK_WINDOW_CACHE_KEY)
    override fun findVesselLastPositionsByInternalReferenceNumber(
        internalReferenceNumber: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position> =
        dbPositionRepository
            .findLastByInternalReferenceNumber(internalReferenceNumber, from, to)
            .map(PositionEntity::toPosition)

    @Cacheable(value = [CacheName.VESSEL_TRACK], key = TRACK_WINDOW_CACHE_KEY)
    override fun findVesselLastPositionsByIrcs(
        ircs: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position> =
        dbPositionRepository
            .findLastByIrcs(ircs, from, to)
            .map(PositionEntity::toPosition)

    @Cacheable(value = [CacheName.VESSEL_TRACK], key = TRACK_WINDOW_CACHE_KEY)
    override fun findVesselLastPositionsByExternalReferenceNumber(
        externalReferenceNumber: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position> =
        dbPositionRepository
            .findLastByExternalReferenceNumber(externalReferenceNumber, from, to)
            .map(PositionEntity::toPosition)

    @Transactional
    override fun save(position: Position) {
        val positionEntity = PositionEntity.fromPosition(position)
        dbPositionRepository.save(positionEntity)
    }

    override fun findAllByMmsi(mmsi: String): List<Position> =
        dbPositionRepository
            .findAllByMmsi(mmsi)
            .map(PositionEntity::toPosition)

    @Cacheable(value = [CacheName.LAST_POSITION_DATE], sync = true)
    override fun findLastPositionDate(): ZonedDateTime =
        dbPositionRepository.findLastPositionDateTime().atZone(ZoneOffset.UTC)
}
