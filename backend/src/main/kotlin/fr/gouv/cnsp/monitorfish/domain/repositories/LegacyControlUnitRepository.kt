package fr.gouv.cnsp.monitorfish.domain.repositories

import fr.gouv.cnsp.monitorfish.domain.entities.mission.ControlUnit

interface LegacyControlUnitRepository {
    fun findAll(): List<ControlUnit>
}
