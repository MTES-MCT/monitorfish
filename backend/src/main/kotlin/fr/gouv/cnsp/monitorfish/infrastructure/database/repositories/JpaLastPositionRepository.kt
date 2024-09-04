package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import com.fasterxml.jackson.databind.ObjectMapper
import fr.gouv.cnsp.monitorfish.domain.entities.alerts.type.AlertTypeMapping
import fr.gouv.cnsp.monitorfish.domain.entities.last_position.LastPosition
import fr.gouv.cnsp.monitorfish.domain.entities.vessel.VesselIdentifier
import fr.gouv.cnsp.monitorfish.domain.repositories.LastPositionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBLastPositionRepository
import jakarta.transaction.Transactional
import org.springframework.cache.annotation.Cacheable
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Repository
import java.time.ZoneOffset.UTC
import java.time.ZonedDateTime

@Repository
class JpaLastPositionRepository(
    private val dbLastPositionRepository: DBLastPositionRepository,
    private val mapper: ObjectMapper,
) : LastPositionRepository {
    @Cacheable(value = ["vessels_all_position"])
    override fun findAll(): List<LastPosition> {
        return dbLastPositionRepository.findAll()
            // We NEED this non filterNotNull (even if the IDE say not so, as the SQL request may return null internalReferenceNumber)
            .filterNotNull()
            .map {
                it.toLastPosition(mapper)
            }
    }

    @Cacheable(value = ["vessels_positions"])
    override fun findAllInLastMonthOrWithBeaconMalfunction(): List<LastPosition> {
        val nowMinusOneMonth = ZonedDateTime.now().minusMonths(1)
        return dbLastPositionRepository.findAllByDateTimeGreaterThanEqualOrBeaconMalfunctionIdNotNull(nowMinusOneMonth)
            // We NEED this non filterNotNull (even if the IDE say not so, as the SQL request may return null internalReferenceNumber)
            .filterNotNull()
            .map {
                it.toLastPosition(mapper)
            }
    }

    @Cacheable(value = ["vessels_positions_with_beacon_malfunctions"])
    override fun findAllWithBeaconMalfunctionBeforeLast48Hours(): List<LastPosition> {
        val nowMinus48Hours = ZonedDateTime.now().minusHours(48)
        return dbLastPositionRepository.findAllByDateTimeLessThanEqualAndBeaconMalfunctionIdNotNull(nowMinus48Hours)
            // We NEED this non filterNotNull (even if the IDE say not so, as the SQL request may return null internalReferenceNumber)
            .filterNotNull()
            .map {
                it.toLastPosition(mapper)
            }
    }

    override fun findLastPositionDate(): ZonedDateTime {
        return try {
            dbLastPositionRepository.findLastPositionDateTime().atZone(UTC)
        } catch (e: EmptyResultDataAccessException) {
            // Date of birth of the CNSP
            ZonedDateTime.of(2012, 4, 17, 0, 0, 0, 1, UTC)
        }
    }

    @Transactional
    override fun removeAlertToLastPositionByVesselIdentifierEquals(
        alertType: AlertTypeMapping,
        vesselIdentifier: VesselIdentifier,
        value: String,
        isValidated: Boolean,
    ) {
        dbLastPositionRepository.removeAlertByVesselIdentifierEquals(
            vesselIdentifier.name,
            value,
            alertType.name,
            isValidated,
        )
    }

    override fun deleteAll() {
        dbLastPositionRepository.deleteAllInBatch()
    }
}
