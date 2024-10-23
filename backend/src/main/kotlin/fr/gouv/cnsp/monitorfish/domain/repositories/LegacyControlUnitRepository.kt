package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission.LegacyControlUnit

interface LegacyControlUnitRepository {
    fun findAll(): List<LegacyControlUnit>
}
