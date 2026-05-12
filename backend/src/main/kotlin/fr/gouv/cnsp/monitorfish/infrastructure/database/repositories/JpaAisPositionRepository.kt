package fr.gouv.cnsp.monitorfish.infrastructure.database.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.ais_position.AisPosition
import fr.gouv.cnsp.monitorfish.domain.repositories.AisPositionRepository
import fr.gouv.cnsp.monitorfish.infrastructure.database.entities.AisPositionEntity
import fr.gouv.cnsp.monitorfish.infrastructure.database.repositories.interfaces.DBAisPositionRepository
import org.springframework.stereotype.Repository
import org.springframework.transaction.annotation.Transactional

@Repository
class JpaAisPositionRepository(
    private val dbAisPositionRepository: DBAisPositionRepository,
) : AisPositionRepository {
    @Transactional
    override fun saveAll(positions: List<AisPosition>) {
        dbAisPositionRepository.saveAll(positions.map { AisPositionEntity.fromAisPosition(it) })
    }
}
