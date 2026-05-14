package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.ais_position.AisPosition
import fr.gouv.cnsp.monitorfish.domain.entities.position.Position
import fr.gouv.cnsp.monitorfish.domain.repositories.AisPositionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AisPositionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBAisPositionRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional
import java.time.ZonedDateTime

@Repository
class JpaAisPositionRepository(
    private val dbAisPositionRepository: DBAisPositionRepository,
) : AisPositionRepository {
    @Transactional
    override fun saveAll(positions: List<AisPosition>) {
        dbAisPositionRepository.saveAll(positions.map { AisPositionEntity.fromAisPosition(it) })
    }

    override fun findVesselLastAisPositionsByCfr(
        cfr: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position> = dbAisPositionRepository.findLastByCfr(cfr, from, to).map { it.toPosition() }

    override fun findVesselLastAisPositionsByIrcs(
        ircs: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position> = dbAisPositionRepository.findLastByIrcs(ircs, from, to).map { it.toPosition() }

    override fun findVesselLastAisPositionsByExternalImmatriculation(
        externalImmatriculation: String,
        from: ZonedDateTime,
        to: ZonedDateTime,
    ): List<Position> = dbAisPositionRepository.findLastByExternalImmatriculation(externalImmatriculation, from, to).map { it.toPosition() }
}
