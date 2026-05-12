package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.ais_position.AisPosition

interface AisPositionRepository {
    fun saveAll(positions: List<AisPosition>)
}
